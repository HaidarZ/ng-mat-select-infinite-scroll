import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

export async function libraryInputs(root) {
  const policy = JSON.parse(await readFile(join(root, 'compatibility.json'), 'utf8'));
  const sourceRoot = join(root, 'projects/ng-mat-select-infinite-scroll/src');
  const source = createHash('sha256').update(JSON.stringify(policy.build));
  async function visit(dir) {
    for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') && entry.name !== 'test.ts') {
        source.update(relative(sourceRoot, file)).update(await readFile(file));
      }
    }
  }
  await visit(sourceRoot);
  const sourceHash = source.digest('hex');
  const inputs = createHash('sha256').update(sourceHash);
  for (const file of ['README.md', 'LICENSE', 'projects/ng-mat-select-infinite-scroll/package.json', 'tools/build-library/build.mjs', 'tools/build-library/package-lock.json']) {
    inputs.update(file).update(await readFile(join(root, file)));
  }
  return { sourceHash, inputsHash: inputs.digest('hex') };
}
