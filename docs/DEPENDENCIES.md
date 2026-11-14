# Build dependencies

Audit snapshot from 14 November 2026:

| Workspace | Critical | High | Moderate | Low |
| --- | --- | --- | --- | --- |
| Angular 22 demo | 0 | 0 | 0 | 0 |
| Angular 15.2 library builder | 0 | 3 | 11 | 3 |
| Root development and unit tests | 0 | 36 | 30 | 7 |

The builder uses Angular 15.2 to support applications on that version. Its remaining high findings concern Angular common, core, and compiler 15.2.0. Other unresolved findings affect the older development tools. Keeping these tools in a separate workspace does not fix their vulnerabilities.

Build overrides pin Piscina 4.9.4 and tar 7.5.23; root overrides also pin proxy-addr 2.0.8 and websocket-driver 0.7.5. Sass 1.93.3 keeps the builder compatible with Node 18. The package build and unit tests passed with these overrides.

The published library has Angular, Material, and RxJS as peers, and tslib as its runtime dependency. Build tools and Angular itself are not bundled. Consumers should keep their own Angular dependencies updated.

Build and test jobs have no publishing credentials. Publication runs separately with Node 24 and npm Trusted Publishing. Re-run audits when changing dependencies or preparing a release.

References: [Piscina advisory](https://github.com/piscinajs/piscina/security/advisories/GHSA-67c8-pqhq-4rmx), [node-tar security](https://github.com/isaacs/node-tar/security), [Angular support policy](https://angular.dev/reference/releases).
