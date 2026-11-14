# Revival status

Updated **14 November 2026**. Candidate: **6.0.0-next.0**.

- Core fixes, standalone/NgModule support, multi-version consumers, demo, docs, and release tooling are implemented.
- **25 unit checks and all 16 latest/minimum Angular 15.2–22 consumer checks pass locally.** The same tarball was used for all checks.
- The Angular 22 demo builds and passes browser checks for paging, search/reset, retained selections, and retry.
- The local release-artifact gate passes. Hosted CI, beta publication/feedback, and stable approval remain separate steps.
- Known limitation: Material can reset its active keyboard item when options append; viewport retention and paging are fixed. See [known limitations](docs/KNOWN_LIMITATIONS.md).

Evidence: [validation summary](docs/VALIDATION.md), [machine-readable record](docs/releases/6.0.0-next.0.validation.json), [dependency assessment](docs/DEPENDENCIES.md).

| Packages | State | Outcome / next step |
| --- | --- | --- |
| R00–R02: baseline, contracts, packaging | Validated | Isolated compiler 15.2.0; one immutable package across consumers. |
| R03–R05: lifecycle, geometry, loading, imports | Validated | Original failures reproduced; 25 meaningful regression checks now pass. |
| R06: selection and keyboard | Validated with documented limitation | #9/#16 sequences and viewport/selection retention pass; Material active-item behavior remains tracked. |
| R07: complete version matrix | Validated locally | Eight majors, each latest/minimum, 36 application bootstraps. |
| R08: demo and adoption | Validated locally | Working demo, compatibility/migration/API docs, request/cache recipes. |
| R09: CI and release tooling | Local validation complete | Run hosted CI against the implementation branch; configure publication access if needed. |
| R10: backlog dispositions | Drafted | All ten issues/two PRs mapped in [GITHUB_TRIAGE.md](docs/GITHUB_TRIAGE.md); publication links precede released-fix claims. |
| R11: beta | Pending | Publish `next` after hosted checks; verify registry artifact and collect two real external-project validations over at least one week. |
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

Check current Git/CI/publication state, continue R09/R11, and preserve the version-support policy in [compatibility.json](compatibility.json). Do not repeat already passing unrelated tests unless source, locks, artifact inputs, or unresolved failures change. Do not count generated fixtures as external beta feedback or mark the whole revival complete before stable registry verification.
