# Candidate validation

Validated locally on 14 November 2026 (macOS arm64) and in [GitHub CI on Ubuntu](https://github.com/HaidarZ/ng-mat-select-infinite-scroll/actions/runs/43583263875) at commit `4ba4ee3`. All unit, consumer, demo, and release-gate jobs passed. The first publication workflow omitted the existing `NPM_TOKEN` secret. The [corrected publication attempt](https://github.com/HaidarZ/ng-mat-select-infinite-scroll/actions/runs/43583272148) restores token authentication and GitHub-release publishing, repeats every validation successfully, and supplies the secret, but npm still rejects publication with `E404` (package access). The candidate remains unpublished pending npm account access.

Release routing checks cover GitHub prerelease/stable events and manual beta/approved-stable runs. Mismatched release tags and prerelease/stable channels are rejected before publication.

Candidate: **6.0.0-next.0**. Compiled with Angular **15.2.0** on Node **v18.19.0**.

Tarball SHA-256: `0e25b5c4dcc6922c3828e9a1e6676c8806ce74f7aa1fa0b736556f6745257fc6`.

**25 unit checks, 16 consumer checks, 36 application bootstraps passed.** Each consumer installs the same tarball, builds production AOT, and exercises both standalone/NgModule imports. Angular 21/22 also exercise zoneless operation.

| Angular major | Minimum tested | Latest tested | Result |
| --- | --- | --- | --- |
| 15 | 15.2.0 | 15.2.10 | Pass |
| 16 | 16.0.0 | 16.2.12 | Pass |
| 17 | 17.0.0 | 17.3.12 | Pass |
| 18 | 18.0.0 | 18.2.14 | Pass |
| 19 | 19.0.0 | 19.2.25 | Pass |
| 20 | 20.0.0 | 20.3.35 | Pass |
| 21 | 21.0.0 | 21.2.26 | Pass |
| 22 | 22.0.0 | 22.2.6 | Pass |

Browser scenarios cover paging, exact scroll-position retention, live loading/completion, repeated opening, preselected last items, the #16 selection sequence, errors/retry, bounded short-list filling, custom density and optgroups, multiple selection, and keyboard paging. Material active-item preservation is characterized separately; its remaining reset behavior is documented in [known limitations](KNOWN_LIMITATIONS.md).

The Angular 22 demo passes a production build and browser checks for paging, search/reset, retained selection, failed requests, and retry. Its screenshot was visually inspected.

The remediated floor builder produces byte-identical package output. Current dependency dispositions are in [DEPENDENCIES.md](DEPENDENCIES.md). Raw local logs/screenshots/receipts are ignored under `artifacts/`; the durable summary is [the validation record](releases/6.0.0-next.0.validation.json).
