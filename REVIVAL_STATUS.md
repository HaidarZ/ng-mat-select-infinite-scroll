# Revival status

Updated **14 November 2026**. Published beta: [**6.0.0-next.0**](https://www.npmjs.com/package/ng-mat-select-infinite-scroll/v/6.0.0-next.0), under `next`.

- Core fixes, standalone/NgModule support, multi-version consumers, demo, docs, and release tooling are implemented.
- **25 unit checks and all 16 latest/minimum Angular 15.2–22 consumer checks pass locally.** The same tarball was used for all checks.
- The Angular 22 demo builds and passes browser checks for paging, search/reset, retained selections, and retry.
- The [complete release workflow](https://github.com/HaidarZ/ng-mat-select-infinite-scroll/actions/runs/43586067177) passed all validation and published through **npm Trusted Publishing only**, with signed provenance and no stored npm token.
- The registry tarball matches the tested artifact byte for byte. Fresh registry installs, production builds, and browser checks pass on Angular **15, 19, and 22** (seven application bootstraps). Provenance subjects and workflow/commit identity match the release artifact.
- `next` is `6.0.0-next.0`; `latest` remains `5.0.0-beta.3`. Beta feedback is open; stable approval remains pending.
- **One consumer project validated:** the existing maintainer-owned example passes a production build and two browser tests in an isolated Angular 15.2 copy. The original Angular 14 repository remains unchanged. See [the report](docs/releases/6.0.0-next.0.example-validation.md).
- Known limitation: Material can reset its active keyboard item when options append; viewport retention and paging are fixed. See [known limitations](docs/KNOWN_LIMITATIONS.md).

Evidence: [validation summary](docs/VALIDATION.md), [machine-readable record](docs/releases/6.0.0-next.0.validation.json), [dependency assessment](docs/DEPENDENCIES.md).

| Packages | State | Outcome / next step |
| --- | --- | --- |
| R00–R02: baseline, contracts, packaging | Validated | Isolated compiler 15.2.0; one immutable package across consumers. |
| R03–R05: lifecycle, geometry, loading, imports | Validated | Original failures reproduced; 25 meaningful regression checks now pass. |
| R06: selection and keyboard | Validated with documented limitation | #9/#16 sequences and viewport/selection retention pass; Material active-item behavior remains tracked. |
| R07: complete version matrix | Validated locally and in CI | Eight majors, each latest/minimum, 36 application bootstraps. |
| R08: demo and adoption | Validated locally and in CI | Working demo, compatibility/migration/API docs, request/cache recipes. |
| R09: CI and release tooling | Validated and used | Full checks and OIDC publication pass at `c1dedcb`; GitHub-release and manual triggers retain the same gates. |
| R10: backlog dispositions | Drafted | All ten issues/two PRs mapped in [GITHUB_TRIAGE.md](docs/GITHUB_TRIAGE.md); publication links precede released-fix claims. |
| R11: beta | Published; 1/2 consumer projects validated | Existing example validated on Angular 15.2; a second project and feedback remain pending. Earliest one-week boundary is 21 November 2026 at 12:40 Beirut time. |
| R12: stable | Pending | Validate stable artifact and obtain the agreed final approval before promoting `latest`. |
| R13: follow-through | Pending | Carry out authorized backlog actions and record maintenance handoff. |

## Release identity

- Tarball: `ng-mat-select-infinite-scroll-6.0.0-next.0.tgz`.
- SHA-256: `0e25b5c4dcc6922c3828e9a1e6676c8806ce74f7aa1fa0b736556f6745257fc6`.
- Implementation fingerprint: `8779dbc3851fe3db544e33d706fa6ff00e5ddd53e9fc27cb4979d927417d0545`.
- Build: Angular/compiler-cli 15.2.0, ng-packagr 15.2.2, TypeScript 4.9.5, Node 18.19.0.
- Browser orchestration: Node 24.15.0, Playwright 1.65.1, Chrome 157.0.8103.51 locally.

The original five lifecycle/configuration/geometry failures were observed before the fixes. Consumer build caches are disabled because same-version tarball extraction can otherwise reuse an older linked library. Source/packaging fingerprints and tarball receipts prevent publishing stale validation.

## Resume

Implementation is on `revive/6.0` in [draft PR #64](https://github.com/HaidarZ/ng-mat-select-infinite-scroll/pull/64); `master` has not been merged. The npm publisher is bound to environment `npm`; the author completed Security Key verification, and OIDC publication succeeded. Do not request or create a replacement npm token. The old secret is no longer referenced by this branch; retire it after the old default-branch workflow has been replaced.

Continue by identifying the second real Angular project for beta validation. The first is the maintainer-owned example at source commit `16ee285a38db5a35e481bdb8a0b17af75213b87a`, tested after an isolated Angular 15.2 migration; it is not independent end-user feedback. Record each project's versions/evidence against implementation fingerprint `8779dbc3851fe3db544e33d706fa6ff00e5ddd53e9fc27cb4979d927417d0545`. Generated registry checks do not count as external-project feedback. The beta was published at `2026-11-14T10:40:43.980Z`; the minimum interval ends at `2026-11-21T10:40:43.980Z`. Resolve feedback before preparing a separately validated stable artifact and obtaining final approval. Do not republish this immutable version or count the whole revival complete before stable registry verification. No unattended monitoring or scheduled promotion is configured.
