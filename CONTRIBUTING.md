# Contributing

Use Node 18.19 for the Angular 15.2 library build and unit tests, and Node 24.15 for browser tests and publishing. The library and demo have separate toolchains.

The [tooling guide](tools/README.md) explains each script and the files it changes.

1. Install root and `tools/build-library` dependencies with `npm ci --ignore-scripts`.
2. Run `npm test`, `npm run build`, and `npm run check:policy`.
3. For each affected consumer, use its `.nvmrc`, run `npm ci --ignore-scripts`, then `node tools/check-compatibility.mjs <major>` from the repository root. Add `--minimum` for minimum-version fixtures.
4. With Node 24.15, install `tools/browser-tests`, install Playwright Chromium if needed, and run `node tools/browser-tests/run.mjs <major>`. Local checks use installed Chrome; CI uses Chromium.
5. Add a regression test for behavior changes. Keep both standalone and NgModule imports working.

Run `npm run format` for the tooling and library source. CI checks the same files with `npm run format:check`. Generated consumer configurations and lockfiles are excluded.

`compatibility.json` lists supported versions and test toolchains. After changing it, run `npm run compat:generate` and update the affected lockfiles. Adding support for an Angular major is a minor library release; dropping support or raising a minimum is a major release.

## Dependency maintenance

Private development workspaces use `overrides` to patch transitive build tools while preserving the Angular/Material versions under test. Consumer pins live in [compatibility.json](compatibility.json). Version selectors retain compatible Piscina versions and keep older Angular builders on webpack 5.111, because 5.112 removes AMD modules they require. These tools are not included in the published library.

Run `npm audit --package-lock-only` in affected workspaces when updating dependencies. Older Angular and development-tool advisories remain; compatibility coverage does not extend upstream security support. See the [consumer guide](compat/README.md) for the override pins and validation commands.

## Releases

The [publishing workflow](.github/workflows/npmpublish.yml) runs the full compatibility matrix and demo checks before publishing the tested tarball. Publish a GitHub prerelease for `next`, or a stable release for `latest`. The release tag must match the package version, optionally prefixed with `v`. The workflow can also be started manually from Actions.

Publishing uses npm Trusted Publishing. Its GitHub configuration is owner `HaidarZ`, repository `ng-mat-select-infinite-scroll`, workflow `npmpublish.yml`, environment `npm`, with `npm publish` allowed. See [npm's setup instructions](https://docs.npmjs.com/trusted-publishers/).

The 6.x line publishes to `latest`. The separate `support/5.x` maintenance branch publishes to `legacy`. Publish maintenance releases with GitHub's `--latest=false` option to preserve the mainline release as **Latest**. Keep the maintenance branch separate from `master`.

For stable releases, review the tested tarball, compatibility results, and documented limitations. A manual stable run requires the exact `approved_version`; a published GitHub release supplies it through the tag.

The [feedback record](docs/releases/6.0.0-feedback.json) keeps the existing real-project validation evidence. See [the release checker guide](tools/README.md#reading-the-release-checker) for flags and checks.
