import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const policy = JSON.parse(await readFile(join(root, 'compatibility.json'), 'utf8'));
for (const consumer of policy.consumers) {
 for (const minimum of [false, true]) {
  const row = minimum ? { ...consumer, angular: consumer.minimum, material: consumer.minimum, cli: consumer.minimum, builder: consumer.minimum, typescript: consumer.minimumTypescript } : consumer;
  const dir = join(root, 'compat', `angular-${row.major}${minimum ? '-minimum' : ''}`);
  await mkdir(dir, { recursive: true });
  const dependencies = Object.fromEntries(['animations', 'common', 'compiler', 'core', 'forms', 'platform-browser', 'platform-browser-dynamic'].map(name => [`@angular/${name}`, row.angular]));
  Object.assign(dependencies, { '@angular/material': row.material, '@angular/cdk': row.material, rxjs: policy.rxjs, tslib: '2.8.1', 'zone.js': row.zone });
  await writeFile(join(dir, 'package.json'), JSON.stringify({
    name: `infinite-scroll-angular-${row.major}-consumer`, private: true,
    scripts: { build: 'ng build --configuration production' }, dependencies,
    devDependencies: { '@angular/cli': row.cli, '@angular-devkit/build-angular': row.builder, '@angular/compiler-cli': row.angular, typescript: row.typescript }
  }, null, 2) + '\n');
  await writeFile(join(dir, '.nvmrc'), row.node + '\n');
  await writeFile(join(dir, 'angular.json'), JSON.stringify({
    version: 1, cli: { analytics: false, cache: { enabled: false } }, projects: { consumer: {
      projectType: 'application', root: '', sourceRoot: 'src', architect: { build: {
        builder: '@angular-devkit/build-angular:browser',
        options: { outputPath: 'dist', index: 'src/index.html', main: 'src/main.ts', polyfills: ['zone.js'], tsConfig: 'tsconfig.json', styles: ['node_modules/@angular/material/prebuilt-themes/indigo-pink.css'], aot: true },
        configurations: { production: { optimization: true, outputHashing: 'none', sourceMap: false } }
      } }
    } }
  }, null, 2) + '\n');
  await writeFile(join(dir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { target: 'ES2022', module: 'ES2022', moduleResolution: row.major >= 17 ? 'bundler' : 'node', experimentalDecorators: true, useDefineForClassFields: false, strict: true, skipLibCheck: false, lib: ['ES2022', 'DOM'], types: [], esModuleInterop: true },
    angularCompilerOptions: { strictTemplates: true }, files: ['src/main.ts']
  }, null, 2) + '\n');
 }
}
console.log(`Generated ${policy.consumers.length * 2} consumer configurations`);
