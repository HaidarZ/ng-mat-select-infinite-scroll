/**
 * Check workspace, library, builder, and consumer versions against compatibility.json.
 * Usage: npm run check:policy; add -- --matrix to emit the CI job matrix.
 * Reads manifests, consumer lockfiles, and Node pins. --matrix appends to
 * GITHUB_OUTPUT when CI provides it; other invocations do not write files.
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
const patchedTools = {
  piscina: [policy.consumerOverrides['piscina@<5'], policy.consumerOverrides['piscina@>=5']],
  webpack: [
    policy.consumerOverrides['webpack@<5.112.0'],
    policy.consumerOverrides['webpack@>=5.112.0'],
  ],
  tar: [policy.consumerOverrides.tar],
};
// The declared range includes both the minimum and latest tested version per major.
for (const row of policy.consumers) {
  for (const minimum of [false, true]) {
    const directory = `compat/angular-${row.major}${minimum ? '-minimum' : ''}`;
    const fixture = await json(`${directory}/package.json`);
    const lock = await json(`${directory}/package-lock.json`);
    assert.deepEqual(fixture.overrides, policy.consumerOverrides, `${directory}: overrides drift`);
    const angular = minimum ? row.minimum : row.angular;
    const material = minimum ? row.minimum : row.material;
    const expected = {
      dependencies: {
        ...Object.fromEntries(
          [
            'animations',
            'common',
            'compiler',
            'core',
            'forms',
            'platform-browser',
            'platform-browser-dynamic',
          ].map((name) => [`@angular/${name}`, angular]),
        ),
        '@angular/material': material,
        '@angular/cdk': material,
        rxjs: policy.rxjs,
        tslib: '2.8.1',
        'zone.js': row.zone,
      },
      devDependencies: {
        '@angular/cli': minimum ? row.minimum : row.cli,
        '@angular-devkit/build-angular': minimum ? row.minimum : row.builder,
        '@angular/compiler-cli': angular,
        typescript: minimum ? row.minimumTypescript : row.typescript,
      },
    };
    // Check every generated pin, the lock's manifest, and its resolved versions.
    for (const section of ['dependencies', 'devDependencies']) {
      assert.deepEqual(fixture[section], expected[section], `${directory}: ${section} drift`);
      assert.deepEqual(
        lock.packages[''][section],
        expected[section],
        `${directory}: stale lockfile`,
      );
      for (const [name, version] of Object.entries(expected[section])) {
        assert.equal(
          lock.packages[`node_modules/${name}`]?.version,
          version,
          `${directory}: locked ${name}`,
        );
      }
    }
    // Keep patched transitive tools without changing the framework versions under test.
    for (const [path, dependency] of Object.entries(lock.packages)) {
      for (const [name, versions] of Object.entries(patchedTools)) {
        if (path.endsWith(`node_modules/${name}`)) {
          assert.ok(versions.includes(dependency.version), `${directory}: patched ${name}`);
        }
      }
    }
    assert.equal((await readFile(join(root, directory, '.nvmrc'), 'utf8')).trim(), row.node);
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
