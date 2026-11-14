# Contributing

Use Node 18.19 for the isolated Angular 15.2 library build/unit tests and Node 24.15 for browser orchestration. Do not raise the library's compiler/API floor to update a demo or test tool.

1. Install root and `tools/build-library` dependencies with `npm ci --ignore-scripts`.
2. Run `npm test`, `npm run build`, and `npm run check:policy`.
3. For each affected consumer, use its `.nvmrc`, run `npm ci --ignore-scripts`, then `node tools/check-compatibility.mjs <major>` from the repository root. Add `--minimum` for minimum-version fixtures.
4. With Node 24.15, install `tools/browser-tests`, install Playwright Chromium if needed, and run `node tools/browser-tests/run.mjs <major>`. Local checks use installed Chrome; CI uses Chromium.
5. Record a reproduction and externally visible regression check for behavioral changes. Both standalone and NgModule consumers must keep working.

`compatibility.json` owns tested toolchain policy. Run `npm run compat:generate` after changing it, update the corresponding lockfiles, and review all generated changes. Adding a proven Angular major is a minor library release; dropping a supported version or raising a minimum is a major release.

## Releases

Build/test/pack before publication; `npm run release:check` requires receipts for the exact tarball from every latest/minimum consumer. The `Publish validated package` workflow runs the complete validation before publishing and supports both GitHub releases and manual runs. A GitHub prerelease publishes under `next`; a stable release publishes under `latest`. Its tag must equal the package version, optionally prefixed with `v`. Publishing a stable GitHub release supplies approval of that exact version; manual stable runs require `approved_version` explicitly. The beta feedback gates apply to both paths.

Publication uses npm Trusted Publishing with OIDC. The workflow does not reference `NPM_TOKEN` or pass a stored npm token to any job. Only the publication job has `id-token: write`; build and consumer jobs cannot request a publication identity.

Configure GitHub Actions in the npm package's **Settings → Trusted publishing** with owner **HaidarZ**, repository **ng-mat-select-infinite-scroll**, workflow filename **npmpublish.yml**, environment **npm**, and **Allow npm publish**. Fields must match exactly. See [npm's trusted-publisher instructions](https://docs.npmjs.com/trusted-publishers/). After account setup, dispatch the current workflow so it uses this OIDC-only configuration; do not retry historical runs that reference a stored token. Subsequent publication failures may be retried from the same OIDC-only run while its successful validation and artifacts remain valid.

Once Trusted Publishing succeeds and this workflow has replaced the old default-branch workflow, retire the unused npm token and GitHub secret. Existing credentials have not been deleted as part of this code change.

Stable publishing requires the exact approved version and `docs/releases/<version>-feedback.json`, with a published beta candidate, two distinct real external-project validations (`project`, `validated`, `sourceHash`, `evidence`), and at least seven days since that candidate's registry publication. Do not fill that record with generated fixtures or assumed feedback.

Retain historical install guidance. If a genuine framework boundary requires another package line, maintain a precise version table and backport relevant fixes; do not unpublish packages as a routine rollback.
