/**
 * Check workspace, library, builder, and consumer versions against compatibility.json.
 * Usage: npm run check:policy; add -- --matrix to emit the CI job matrix.
 * Reads manifests only, except --matrix appends to GITHUB_OUTPUT when CI provides it.
 * It checks configuration consistency; builds/browser tests establish compatibility.
 */
import { appendFile, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = async (path) => JSON.parse(await readFile(join(root, path), 'utf8'));
const policy = await json('compatibility.json');
const workspace = await json('package.json');
const library = await json('projects/ng-mat-select-infinite-scroll/package.json');
// Publishing the workspace would ship development dependencies instead of the library.
assert.equal(workspace.private, true, 'workspace must not publish');
assert.equal(workspace.version, library.version, 'package versions must agree');
assert.equal(library.peerDependencies['@angular/core'], policy.angularPeer);
assert.equal(library.peerDependencies['@angular/material'], policy.angularPeer);
assert.equal(
  (await json('tools/build-library/package.json')).devDependencies['@angular/compiler-cli'],
  policy.build.angular,
);
const matrix = [];
// The declared range includes both the minimum and latest tested version per major.
for (const row of policy.consumers) {
  for (const minimum of [false, true]) {
    const fixture = await json(
      `compat/angular-${row.major}${minimum ? '-minimum' : ''}/package.json`,
    );
    assert.equal(fixture.dependencies['@angular/core'], minimum ? row.minimum : row.angular);
    assert.equal(fixture.dependencies['@angular/material'], minimum ? row.minimum : row.material);
    assert.equal(
      fixture.devDependencies.typescript,
      minimum ? row.minimumTypescript : row.typescript,
    );
    assert.ok(
      !fixture.dependencies[policy.package],
      'tarball is installed after framework dependencies',
    );
    matrix.push({ major: row.major, minimum, node: row.node });
  }
}
assert.ok(
  matrix.some((row) => row.major === 19),
  'Angular 19 is required',
);
if (process.argv.includes('--matrix')) {
  const value = JSON.stringify({ include: matrix });
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `matrix=${value}\n`);
  console.log(value);
} else console.log(`Policy verified: ${matrix.length} consumers, version ${library.version}`);
