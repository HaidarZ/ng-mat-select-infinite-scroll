/**
 * Install the built tarball for the demo's prestart/prebuild hooks (Node 24.15).
 * Reads dist/artifact.json and verifies its archive before installing it.
 * Replaces only the demo's installed library. --no-save/--package-lock=false
 * leave its manifest and framework lock unchanged; nothing is published.
 */
import { readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifact = JSON.parse(await readFile(join(root, 'dist/artifact.json'), 'utf8'));
const tarball = join(root, 'dist', artifact.file);
if (
  createHash('sha256')
    .update(await readFile(tarball))
    .digest('hex') !== artifact.sha256
)
  throw new Error('Artifact hash changed');
await rm(join(root, 'projects/example/node_modules/ng-mat-select-infinite-scroll'), {
  recursive: true,
  force: true,
});
execFileSync(
  'npm',
  ['install', '--no-save', '--package-lock=false', '--ignore-scripts', '--no-audit', tarball],
  { cwd: join(root, 'projects/example'), stdio: 'inherit' },
);
