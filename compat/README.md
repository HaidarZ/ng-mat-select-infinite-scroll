# Compatibility checks

`compatibility.json` is the target policy; support is established by passing checks, not peer declarations alone. Each fixture owns a lockfile. The library is installed from the same tarball without dependency overrides or source aliases.

```sh
nvm use
npm ci --prefix tools/build-library --ignore-scripts
npm run build
npm run compat:generate
# Use the Node version in compat/angular-19/.nvmrc:
cd compat/angular-19
npm ci --ignore-scripts
cd ../..
npm run compat:check -- 19
node tools/browser-tests/run.mjs 19
```

Initial fixture setup uses `npm install --ignore-scripts` to generate its lockfile; CI uses `npm ci`. The tarball is installed separately with `--no-save --package-lock=false` so a new artifact hash never invalidates a checked-in framework dependency lockfile.

| Contract | Expected behavior | Reports |
| --- | --- | --- |
| Completion | `complete` immediately suppresses pending/future emissions, including changes while open; resetting allows a new dataset. | #62 compatibility, core audit |
| Lifetime | One listener per open panel; no emission after close/destroy; cancel deferred initialization and pending debounce. | #16, core audit |
| Geometry | Threshold uses actual panel dimensions, supports percentage/pixel distances and fractional measurements, and rejects invalid/negative values. | #17, #34 |
| Opening | Check a settled panel even without a scroll event; short lists can request a page, bounded by loading/completion and actual option growth. | #9, #16 |
| Loading | Optional `loading` suppresses emissions and resumes checks on completion; the consumer owns HTTP, failure/retry, cancellation and cross-select caching. | #49 |
| Selection | Appending pages must not replace option identities or move the user's active keyboard focus; consumer recipes retain selected options during resets. | #6, #19 |
| Imports | Both standalone directive and existing NgModule work; standard MatSelect is covered, MatLegacySelect is a separate integration. | #21, #43, #62 |

Browser receipts are written under ignored `artifacts/`; release validation records the artifact SHA-256. See the revival ledger for completed versus pending checks.
