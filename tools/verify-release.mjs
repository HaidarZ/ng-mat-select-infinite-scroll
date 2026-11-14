/**
 * Check an already-built tarball against current inputs and consumer receipts.
 * Default invocation reads local files only: npm run release:check
 * --publish adds an npm registry write; stable publication also reads npm metadata.
 * Flags, data files, side effects, and custom policy are documented in README.md.
 */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { libraryInputs } from './library-inputs.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = async path => JSON.parse(await readFile(join(root, path), 'utf8'));
const policy = await json('compatibility.json');
const artifact = await json('dist/artifact.json');
const library = await json('projects/ng-mat-select-infinite-scroll/package.json');
const tarball = join(root, 'dist', artifact.file);
// Prevent accidentally releasing bytes or build inputs other than those tested.
assert.equal(artifact.version, library.version);
assert.equal(createHash('sha256').update(await readFile(tarball)).digest('hex'), artifact.sha256);
assert.equal(artifact.compiler, policy.build.angular);
assert.equal(artifact.inputsHash, (await libraryInputs(root)).inputsHash, 'source or packaging inputs changed after validation');
// Receipts come from browser-tests/run.mjs. Unit/demo results are enforced by
// ci.yml job dependencies; they are not checked here.
for (const row of policy.consumers) {
  for (const minimum of [false, true]) {
    const receipt = await json(`artifacts/browser-${row.major}${minimum ? '-minimum' : ''}.json`);
    assert.equal(receipt.major, row.major);
    assert.equal(receipt.minimum, minimum);
    assert.equal(receipt.angularVersion, minimum ? row.minimum : row.angular, 'runtime Angular version must match the target');
    assert.equal(receipt.passed, true);
    assert.equal(receipt.artifact.sha256, artifact.sha256, 'receipt must test the release tarball');
    assert.ok(receipt.results.some(result => result.mode === 'module'));
    assert.ok(receipt.results.some(result => result.mode === 'standalone'));
  }
}
const arg = name => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined;
// A GitHub release must describe the same version as the validated artifact.
const releaseTag = arg('--release-tag');
if (releaseTag) {
  assert.ok([artifact.version, `v${artifact.version}`].includes(releaseTag), 'GitHub release tag must match the validated package version');
}
const channel = arg('--channel') || (artifact.version.includes('-') ? 'next' : 'latest');
assert.ok(['next', 'latest'].includes(channel));
assert.equal(channel === 'next', artifact.version.includes('-'), 'channel must match prerelease/stable version');
if (process.argv.includes('--publish')) {
  if (channel === 'latest') {
    // Revival policy, not a framework requirement: explicit version approval,
    // two documented external projects on this implementation, and a beta week.
    assert.equal(arg('--approved-version'), artifact.version, 'stable publication requires explicit approval of this version');
    const feedback = await json(`docs/releases/${artifact.version}-feedback.json`);
    const projects = feedback.validations.filter(item => item.validated && item.sourceHash === artifact.sourceHash && item.evidence);
    assert.ok(new Set(projects.map(item => item.project)).size >= 2, 'two real external-project validations are required');
    const registry = await (await fetch(`https://registry.npmjs.org/${policy.package}`)).json();
    const published = registry.time?.[feedback.candidate];
    assert.ok(published && Date.now() - Date.parse(published) >= 7 * 24 * 60 * 60 * 1000, 'beta feedback window has not elapsed');
  }
  // The only registry write in this script. CI supplies OIDC authentication;
  // none of the preceding consistency checks grants publication permission.
  execFileSync('npm', ['publish', tarball, '--tag', channel], { stdio: 'inherit' });
}
console.log(`Verified ${artifact.file} for ${channel}: ${artifact.sha256}`);
