# Maintainer tooling

These scripts run ng-packagr, Angular CLI, npm, and Playwright for builds, compatibility checks, and releases. `generate-consumers.mjs` generates consumer configurations; npm generates the lockfiles.

These scripts run during development and CI. They are not included in the published library.

Each entry point documents its command, inputs, and file/network effects in the source. Run `npm run format` to apply the shared Prettier configuration; `npm run format:check` is enforced in CI. Embedded templates and generated files are left unchanged.

## Script map

| Script | Purpose | Files changed / other effects |
| --- | --- | --- |
| [build-library/build.mjs](build-library/build.mjs) | Build with the pinned Angular 15.2 compiler, then run `npm pack`. | Replaces the ignored build staging directory; writes `dist/`, the tarball, and `dist/artifact.json`. |
| [library-inputs.mjs](library-inputs.mjs) | Calculate fingerprints used by the builder and release checker. | Reads source/build inputs; returns hashes. |
| [generate-consumers.mjs](generate-consumers.mjs) | Generate each Angular version's consumer configuration from `compatibility.json`. | Overwrites fixture manifests, Angular/TypeScript configuration, and `.nvmrc` files. Does not generate lockfiles. |
| [check-policy.mjs](check-policy.mjs) | Check that manifests match the compatibility configuration. | Normally reads only. `--matrix` also writes the job matrix to `GITHUB_OUTPUT` in CI. |
| [check-compatibility.mjs](check-compatibility.mjs) | Prepare one consumer, install the local tarball, and build with Angular CLI. | Replaces generated fixture source/build/cache and the installed library; runs `npm install`. |
| [browser-tests/run.mjs](browser-tests/run.mjs) | Exercise the built consumer in each import/change-detection mode. | Starts a loopback server and headless browser; writes `artifacts/browser-*.json` after success. |
| [install-demo-library.mjs](install-demo-library.mjs) | Install the built tarball before the demo starts/builds. | Replaces the demo's installed library; runs `npm install`. |
| [browser-tests/demo.mjs](browser-tests/demo.mjs) | Exercise the built demo's paging, search, selection, and retry. | Starts a loopback server/browser; writes `artifacts/demo.png`. |
| [verify-release.mjs](verify-release.mjs) | Check the tarball and consumer results; optionally publish. | Default: reads only. `--publish`: publishes the verified tarball to npm. |

For build/consumer commands and Node versions, see [CONTRIBUTING.md](../CONTRIBUTING.md) and [compat/README.md](../compat/README.md). Run configuration generation when changing the version matrix, rather than before every test.

## Why a separate builder?

Angular documents that an application's Angular version must be at least the library's build version. To support Angular 15.2 consumers, this project builds with 15.2 and uses partial compilation. The demo has an independent Angular 22 toolchain. See [Angular's version compatibility guidance](https://angular.dev/tools/libraries/creating-libraries#ensuring-library-version-compatibility) and [partial compilation](https://angular.dev/tools/libraries/angular-package-format#partial-compilation).

The build script uses a temporary directory so imports resolve against the pinned builder dependencies. It copies the inputs, runs ng-packagr, and records the package hash.

## Reading the release checker

`npm run release:check` checks existing output. It does not build, run tests, or publish. Its order is:

1. Compare package version, compiler, tarball bytes, and current source/packaging inputs with `dist/artifact.json`.
2. Read every minimum/latest consumer receipt and check its Angular version, tarball hash, success flag, and standalone/NgModule results.
3. Check the optional release tag and the chosen npm channel.
4. With `--publish`, require the approved version for stable publication, then run `npm publish` on that tarball.

| Flag | Meaning |
| --- | --- |
| `--publish` | Actually publish after validation. Authentication is supplied by the OIDC workflow. |
| `--channel next\|latest` | Select the npm tag; defaults to `next` for prereleases and `latest` otherwise. Must agree with the package version. |
| `--release-tag <tag>` | If supplied, require the exact package version, optionally prefixed with `v`. |
| `--approved-version <version>` | Required for stable publication; must equal the package version. |

## Publication checks

Stable publication requires an **approved version** and the validated package/consumer receipts. The [feedback record](../docs/releases/6.0.0-feedback.json) preserves the existing real-project validation.

The checker matches package hashes and recorded consumer results. Unit and demo tests run as separate jobs in [ci.yml](../.github/workflows/ci.yml). GitHub permissions control who can publish; the approval argument only checks the version string. See [npm's Trusted Publishing documentation](https://docs.npmjs.com/trusted-publishers/) for OIDC setup.
