/**
 * Install the packed library into one consumer and run its production AOT build.
 * Usage: node tools/check-compatibility.mjs <major> [--minimum].
 * Run with the Node version in that consumer's .nvmrc, after its npm ci.
 * Reads dist/artifact.json, its tarball, and compat/template. Replaces generated
 * fixture source/build/cache and the installed library; preserves framework locks.
 * Browser checks are a separate step in tools/browser-tests/run.mjs.
 */
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const major = Number(process.argv[2]);
const minimum = process.argv.includes('--minimum');
const policy = JSON.parse(await readFile(join(root, 'compatibility.json'), 'utf8'));
const row = policy.consumers.find((item) => item.major === major);
if (!row) throw new Error('Choose a supported consumer major, e.g. npm run compat:check -- 19');
const fixture = join(root, 'compat', `angular-${major}${minimum ? '-minimum' : ''}`);
const artifact = JSON.parse(await readFile(join(root, 'dist/artifact.json'), 'utf8'));
const tarball = join(root, 'dist', artifact.file);
const sha256 = createHash('sha256')
  .update(await readFile(tarball))
  .digest('hex');
if (sha256 !== artifact.sha256) throw new Error('Artifact hash changed');
await mkdir(join(fixture, 'src'), { recursive: true });
await cp(join(root, 'compat/template'), join(fixture, 'src'), { recursive: true });
// Built-in control flow is available from 17; NgFor is removed in Angular 22.
if (major >= 17) {
  const main = join(fixture, 'src/main.ts');
  await writeFile(
    main,
    (await readFile(main, 'utf8')).replace(
      '<mat-option *ngFor="let option of options" [value]="option">Option {{option}}</mat-option>',
      '@for (option of options; track option) { <mat-option [value]="option">Option {{option}}</mat-option> }',
    ),
  );
}
// Angular 21+ defaults to zoneless operation. Keep explicit zone and
// zoneless fixture modes so the same browser scenarios can exercise both.
if (major >= 21) {
  const main = join(fixture, 'src/main.ts');
  const provider =
    "new URLSearchParams(location.search).has('zoneless') ? provideZonelessChangeDetection() : provideZoneChangeDetection()";
  await writeFile(
    main,
    (await readFile(main, 'utf8'))
      .replace(
        '/* CHANGE_DETECTION_IMPORTS */',
        ', provideZonelessChangeDetection, provideZoneChangeDetection',
      )
      .replace('/* CHANGE_DETECTION_PROVIDER */', provider)
      .replace('/* CHANGE_DETECTION_STANDALONE */', `, (${provider})`),
  );
}
await rm(join(fixture, 'node_modules', policy.package), { recursive: true, force: true });
// npm tarballs use normalized mtimes. Angular/Webpack can otherwise reuse a
// previous build of the same prerelease version from its managed-path cache.
await rm(join(fixture, '.angular/cache'), { recursive: true, force: true });
await rm(join(fixture, 'dist'), { recursive: true, force: true });
// Install the archive separately so changing it does not rewrite the framework lock.
execFileSync(
  'npm',
  ['install', '--no-save', '--package-lock=false', '--ignore-scripts', '--no-audit', tarball],
  { cwd: fixture, stdio: 'inherit' },
);
execFileSync(
  process.execPath,
  [join(fixture, 'node_modules/@angular/cli/bin/ng.js'), 'build', '--configuration', 'production'],
  { cwd: fixture, stdio: 'inherit', env: { ...process.env, NG_CLI_ANALYTICS: 'false' } },
);
console.log(
  `Angular ${major}${minimum ? ' minimum' : ''}: production AOT passed for ${artifact.file} (${sha256})`,
);
