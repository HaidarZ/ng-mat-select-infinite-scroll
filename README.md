# Angular Material Select Infinite Scroll — 5.x

Load pages of options as users scroll an Angular Material select. This maintenance line supports Angular/Material **15.0–16** and keeps the NgModule API from `5.0.0-beta.3`.

```sh
npm install ng-mat-select-infinite-scroll@5
```

Import `MatSelectInfiniteScrollModule` alongside `MatSelectModule` and `MatFormFieldModule`. Standalone applications can include the same module in a component's `imports`.

```html
<mat-select msInfiniteScroll [complete]="complete" (infiniteScroll)="loadNextPage()">
  <mat-option *ngFor="let item of options" [value]="item.id">{{ item.name }}</mat-option>
</mat-select>
```

| Input | Default | Meaning |
| --- | --- | --- |
| `threshold` | `'15%'` | Distance from the bottom, as a percentage or pixel string. |
| `debounceTime` | `150` | Milliseconds to wait after scrolling. |
| `complete` | `false` | Stops requests when set before the panel opens. |

`infiniteScroll` emits `void`. Fetch the initial page in your component and guard every subsequent request:

```ts
loadNextPage() {
  if (this.loading || this.complete) return;
  this.loading = true;
  // Fetch and append a page; update complete and clear loading on success/error.
}
```

## Existing limitations

This release preserves the beta's implementation:

- `complete`, `threshold`, and `debounceTime` changes are read when the panel opens. Keep a host-side loading/completion guard, including while the panel is open.
- Closing a panel does not cancel pending scroll work or remove its listener. Reopening can accumulate listeners until directive destruction.
- Opening a short list does not request more automatically. Fetch the initial page yourself.
- Appending options can reset the scroll position and Material's active keyboard item.

The 6.x line fixes live inputs, close-time cleanup, and append positioning, and adds a `loading` input and direct standalone imports. Angular/Material 15.2+ applications can try `ng-mat-select-infinite-scroll@next` instead.

## Development and release checks

Use Node 18.19 (`nvm use`), then run `npm ci --ignore-scripts`, `npm test`, and `npm run package`. The library is built with Angular **15.0.0** in partial compilation mode.

CI installs that tarball into Angular/Material **15.0.0, 15.2.10/15.2.9, 16.0.0, and 16.2.12/16.2.14** consumers. Each runs an NgModule host and a standalone host importing the NgModule. Browser tests use Node 24.15 and Playwright. Two expected-failure tests record the live-completion and pending-close limitations; they are not claimed as fixed.

To run one consumer locally:

```sh
npm ci --prefix compat/angular-15 --ignore-scripts
cp -R compat/template compat/angular-15/src
cd compat/angular-15
npm install ../../dist/*.tgz --no-save --package-lock=false --ignore-scripts
npm run build
cd ../..
npm ci --prefix compat/browser-tests --ignore-scripts
CONSUMER=angular-15 node compat/browser-tests/node_modules/playwright/cli.js test --config compat/browser-tests/playwright.config.mjs
```

The publishing workflow validates the package first and uses npm Trusted Publishing through `npmpublish.yml` and the `npm` environment. Publication requires a matching GitHub release tag or an explicitly supplied `approved_version`. Preparing this branch does not publish a version.

[Changelog](CHANGELOG.md) · [MIT license](LICENSE)
