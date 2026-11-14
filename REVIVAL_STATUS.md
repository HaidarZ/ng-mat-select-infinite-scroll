# Revival status

Updated **14 November 2026**. Candidate: **6.0.0-next.0**.

- Core fixes, standalone/NgModule support, multi-version consumers, demo, docs, and release tooling are implemented.
- **25 unit checks and all 16 latest/minimum Angular 15.2–22 consumer checks pass locally.** The same tarball was used for all checks.
- The Angular 22 demo builds and passes browser checks for paging, search/reset, retained selections, and retry.
- The local release-artifact gate and [hosted CI](https://github.com/HaidarZ/ng-mat-select-infinite-scroll/actions/runs/43541949727) pass, including all 16 consumers and the demo. Beta publication/feedback and stable approval remain separate steps.
- The [beta workflow](https://github.com/HaidarZ/ng-mat-select-infinite-scroll/actions/runs/43542952173) repeated every check successfully, then npm rejected publication with `E404` (package access). Registry inspection confirms `6.0.0-next.0` is unpublished and `latest` remains `5.0.0-beta.3`. Verify npm trusted-publisher access using [the exact settings](CONTRIBUTING.md#releases).
- Known limitation: Material can reset its active keyboard item when options append; viewport retention and paging are fixed. See [known limitations](docs/KNOWN_LIMITATIONS.md).

Evidence: [validation summary](docs/VALIDATION.md), [machine-readable record](docs/releases/6.0.0-next.0.validation.json), [dependency assessment](docs/DEPENDENCIES.md).

| Packages | State | Outcome / next step |
| --- | --- | --- |
| R00–R02: baseline, contracts, packaging | Validated | Isolated compiler 15.2.0; one immutable package across consumers. |
| R03–R05: lifecycle, geometry, loading, imports | Validated | Original failures reproduced; 25 meaningful regression checks now pass. |
| R06: selection and keyboard | Validated with documented limitation | #9/#16 sequences and viewport/selection retention pass; Material active-item behavior remains tracked. |
| R07: complete version matrix | Validated locally and in CI | Eight majors, each latest/minimum, 36 application bootstraps. |
| R08: demo and adoption | Validated locally and in CI | Working demo, compatibility/migration/API docs, request/cache recipes. |
| R09: CI and release tooling | Validated; publication access pending | Hosted checks and release gate pass at `3e4d59c`; npm rejected the subsequent publication. |
| R10: backlog dispositions | Drafted | All ten issues/two PRs mapped in [GITHUB_TRIAGE.md](docs/GITHUB_TRIAGE.md); publication links precede released-fix claims. |
| R11: beta | Awaiting npm access | Verify the package's trusted publisher, retry publication, then verify the registry artifact and collect two real external-project validations over at least one week. |
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

Implementation is in [draft PR #64](https://github.com/HaidarZ/ng-mat-select-infinite-scroll/pull/64). After npm trusted-publisher access is confirmed, retry only the failed job with `gh run rerun 43542952173 --failed --repo HaidarZ/ng-mat-select-infinite-scroll`. This retains the successful validation and immutable artifact from the same run. Verify the registry tarball hash and fresh Angular 15/19/22 installs after publication; begin the beta feedback interval only then. If artifacts have expired or package inputs change, dispatch `npmpublish.yml` on `revive/6.0` with `channel=next` to regenerate the full validation. Preserve [compatibility.json](compatibility.json), do not count generated fixtures as external feedback, and do not mark the revival complete before stable registry verification.
