/**
 * Build and pack the library with the pinned Angular 15.2 toolchain.
 * Usage: npm run build (Node 18.19).
 * Reads compatibility.json, library source/manifest, README, and LICENSE.
 * Recreates .stage/ and writes dist/, the npm tarball, and dist/artifact.json.
 * This script does not publish; every consumer later installs this same tarball.
 */
import { cp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { libraryInputs } from '../library-inputs.mjs';

const builder = dirname(fileURLToPath(import.meta.url));
const root = resolve(builder, '../..');
const stage = join(builder, '.stage');
const policy = JSON.parse(await readFile(join(root, 'compatibility.json'), 'utf8'));
const manifest = JSON.parse(
  await readFile(join(root, 'projects/ng-mat-select-infinite-scroll/package.json'), 'utf8'),
);
const compiler = JSON.parse(
  await readFile(join(builder, 'node_modules/@angular/compiler-cli/package.json'), 'utf8'),
);
// Check the compilation floor before touching generated output.
if (compiler.version !== policy.build.angular)
  throw new Error('Builder compiler does not match compatibility.json');
if (!process.version.startsWith('v18.'))
  throw new Error('Run the floor build with Node 18; see compatibility.json');
if (
  manifest.peerDependencies['@angular/core'] !== policy.angularPeer ||
  manifest.peerDependencies['@angular/material'] !== policy.angularPeer
) {
  throw new Error('Library peers do not match compatibility.json');
}
await rm(stage, { recursive: true, force: true });
await rm(join(root, 'dist/artifact.json'), { force: true });
await mkdir(stage, { recursive: true });
// A staged package resolves Angular from the builder's dependencies, rather
// than the root workspace used by the unit tests or the Angular 22 demo.
await cp(join(root, 'projects/ng-mat-select-infinite-scroll/src'), join(stage, 'src'), {
  recursive: true,
});
await cp(join(root, 'README.md'), join(stage, 'README.md'));
await cp(join(root, 'LICENSE'), join(stage, 'LICENSE'));
await symlink(join(builder, 'node_modules'), join(stage, 'node_modules'), 'dir');
await writeFile(join(stage, 'package.json'), JSON.stringify(manifest, null, 2));
await writeFile(
  join(stage, 'ng-package.json'),
  JSON.stringify(
    {
      dest: relative(stage, join(root, 'dist/ng-mat-select-infinite-scroll')),
      lib: { entryFile: 'src/public-api.ts' },
      assets: ['README.md', 'LICENSE'],
    },
    null,
    2,
  ),
);
await writeFile(
  join(stage, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        baseUrl: '.',
        target: 'ES2020',
        module: 'ES2020',
        moduleResolution: 'node',
        lib: ['ES2020', 'DOM'],
        strict: true,
        experimentalDecorators: true,
        importHelpers: true,
        skipLibCheck: false,
        declaration: true,
        inlineSources: true,
        sourceMap: true,
        types: [],
      },
      angularCompilerOptions: {
        compilationMode: 'partial',
        strictTemplates: true,
        strictInjectionParameters: true,
      },
      exclude: ['src/test.ts', '**/*.spec.ts'],
    },
    null,
    2,
  ),
);
// ng-packagr produces the Angular package; npm pack produces the tested archive.
execFileSync(
  process.execPath,
  [
    join(builder, 'node_modules/ng-packagr/cli/main.js'),
    '-p',
    join(stage, 'ng-package.json'),
    '-c',
    join(stage, 'tsconfig.json'),
  ],
  { cwd: stage, stdio: 'inherit' },
);
const dist = join(root, 'dist');
const output = execFileSync('npm', ['pack', '--json', '--pack-destination', dist], {
  cwd: join(dist, 'ng-mat-select-infinite-scroll'),
  encoding: 'utf8',
});
const packed = JSON.parse(output)[0];
for (const required of ['README.md', 'LICENSE', 'index.d.ts', 'package.json']) {
  if (!packed.files.some((file) => file.path === required))
    throw new Error(`Tarball missing ${required}`);
}
const inputs = await libraryInputs(root);
// Downstream jobs use this manifest to reject stale or mismatched packages.
const artifact = {
  version: manifest.version,
  file: packed.filename,
  sha256: createHash('sha256')
    .update(await readFile(join(dist, packed.filename)))
    .digest('hex'),
  compiler: compiler.version,
  node: process.version,
  ...inputs,
};
await writeFile(join(dist, 'artifact.json'), JSON.stringify(artifact, null, 2) + '\n');
console.log(JSON.stringify(artifact, null, 2));
