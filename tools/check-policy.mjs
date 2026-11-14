import { appendFile, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = async path => JSON.parse(await readFile(join(root, path), 'utf8'));
const policy = await json('compatibility.json');
const workspace = await json('package.json');
const library = await json('projects/ng-mat-select-infinite-scroll/package.json');
assert.equal(workspace.private, true, 'workspace must not publish');
assert.equal(workspace.version, library.version, 'package versions must agree');
assert.equal(library.peerDependencies['@angular/core'], policy.angularPeer);
assert.equal(library.peerDependencies['@angular/material'], policy.angularPeer);
assert.equal((await json('tools/build-library/package.json')).devDependencies['@angular/compiler-cli'], policy.build.angular);
const matrix = [];
for (const row of policy.consumers) {
  for (const minimum of [false, true]) {
    const fixture = await json(`compat/angular-${row.major}${minimum ? '-minimum' : ''}/package.json`);
    assert.equal(fixture.dependencies['@angular/core'], minimum ? row.minimum : row.angular);
    assert.equal(fixture.dependencies['@angular/material'], minimum ? row.minimum : row.material);
    assert.equal(fixture.devDependencies.typescript, minimum ? row.minimumTypescript : row.typescript);
    assert.ok(!fixture.dependencies[policy.package], 'tarball is installed after framework dependencies');
    matrix.push({ major: row.major, minimum, node: row.node });
  }
}
assert.ok(matrix.some(row => row.major === 19), 'Angular 19 is required');
if (process.argv.includes('--matrix')) {
  const value = JSON.stringify({ include: matrix });
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `matrix=${value}\n`);
  console.log(value);
} else console.log(`Policy verified: ${matrix.length} consumers, version ${library.version}`);
