# Dependency assessment

Reviewed 14 November 2026. Audits describe dependency trees, not a count of exploitable defects in the directive. Full local reports are under ignored `artifacts/`.

| Workspace | npm audit result | Disposition |
| --- | --- | --- |
| Angular 22 demo | 0 findings | Current separate application toolchain; application/browser smoke passes. |
| Isolated Angular 15.2 builder | 17 findings: 0 critical, 3 high, 11 moderate, 3 low | Critical Piscina/tar findings patched with scoped overrides; remaining Angular/compiler and build-tool advisories are recorded below. |
| Root unit-test/development workspace | 73 findings: 0 critical, 36 high, 30 moderate, 7 low | Four critical entries remediated with patched Piscina, tar, proxy-addr and websocket-driver. Older framework/CLI/transitive findings remain confined to the legacy development/test toolchain. |

The builder pins Sass 1.93.3 because newer Sass pulls a watcher requiring a newer Node runtime. Piscina 4.9.4 and tar 7.5.23 remove the recorded critical advisories; the floor build was rerun with these versions and produced byte-identical library output. Root overrides are also covered by the passing unit suite. These overrides concern development tools, not consumer dependency resolution.

The three remaining high builder entries are Angular common/core/compiler 15.2.0. Raising these to a new Angular major would raise the compilation floor and remove the advertised older consumers. This compiler-only workspace builds the directive/module; it is not the demo server and its old framework is not bundled into the published package. Remaining moderate/low entries include older compiler/packager tooling. This is a documented compatibility tradeoff, not a claim that those framework versions are secure for arbitrary applications.

The published library declares Angular, Material and RxJS as peers and tslib as its only runtime dependency; it does not ship the builder, CLI, worker pool, tar extraction tools, or a copy of Angular. Each consuming application remains responsible for its framework version. Compatibility with an upstream-EOL version does not extend that framework's security support.

Build/test jobs receive no publication credentials. The release job publishes an already validated tarball using a separate Node 24/OIDC environment. Legacy job caches are not shared with publication, and consumer build caches are disabled to prevent stale same-version tarball reuse. No audit findings are silently marked fixed by peer-range changes.

Relevant upstream records: [Piscina patch/advisory](https://github.com/piscinajs/piscina/security/advisories/GHSA-67c8-pqhq-4rmx), [node-tar security](https://github.com/isaacs/node-tar/security), and [Angular supported versions](https://angular.dev/reference/releases). Re-audit before publication; do not apply a forced Angular-major upgrade to this build workspace without a version-support decision.
