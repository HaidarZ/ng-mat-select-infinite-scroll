# Changelog

All notable changes are documented here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Historical entries use tagged source, GitHub release notes, and npm publication dates. The initial 0.1.0 tag was not published to npm.

## [Unreleased]

## [5.0.0] - 2026-11-14

### Changed

- Stabilize the Angular/Material 15–16 maintenance line from 5.0.0-beta.3 with the same directive implementation and public API.
- Build with Angular 15.0.0 and validate packed-library consumers across Angular/Material 15–16.
- Document existing limitations and add compatibility tests for NgModule and standalone hosts.
- Publish through npm Trusted Publishing under `legacy`, keeping `latest` available for 6.x.

### Fixed

- Replace the outdated directive-constructor test with a real Material host test.
- Clear the build cache before packing to avoid stale source-map comments on repeated builds.

## [5.0.0-beta.3] - 2025-06-26

### Fixed

- Ignore scroll events whose target no longer exists ([#61](https://github.com/HaidarZ/ng-mat-select-infinite-scroll/pull/61)).

## [5.0.0-beta.2] - 2025-03-15

### Fixed

- Defer initialization after `openedChange` so the Material panel is available, including on Angular 19.2 ([#58](https://github.com/HaidarZ/ng-mat-select-infinite-scroll/pull/58)). Declared peer support remains Angular/Material 15–16.

## [5.0.0-beta.1] - 2024-12-22

### Added

- Support for Angular/Material 15–16 and Material's MDC select.

### Removed

- Support for Angular/Material versions below 15.

## [4.0.0] - 2022-08-24

### Added

- Angular 14 compatibility.

## [3.0.1] - 2021-11-09

### Added

- Angular 13 compatibility.

## [3.0.0] - 2021-06-01

### Added

- Angular 11 and 12 compatibility.

### Fixed

- Remove reliance on Material's removed `SELECT_ITEM_HEIGHT_EM` export.

## [2.1.1] - 2020-08-07

### Fixed

- Correct peer dependency ranges for Angular/Material 6–10.

## [2.1.0] - 2020-08-07

### Added

- Angular 10 compatibility.

## [2.0.0] - 2019-12-16

### Added

- Angular 9 compatibility.

### Changed

- Use component-specific Material entry points, such as `@angular/material/select`, in place of the Material package's root entry point.

## [1.2.1] - 2019-11-25

### Fixed

- Publish the built library rather than the workspace files to npm.

## [1.2.0] - 2019-11-23

### Added

- Configurable `debounceTime`, defaulting to 150 milliseconds.

### Fixed

- Reduce duplicate page requests during scrolling and slow page loads.
- Clean up the panel-opening subscription when the directive is destroyed.

## [1.1.0] - 2019-07-20

### Added

- Angular/Material 6 and 8 compatibility alongside Angular 7.

## [1.0.1] - 2019-02-22

### Changed

- Accept Angular/Material 7.x peer versions and include package metadata.

## [1.0.0] - 2019-02-19

### Added

- First npm release of the infinite-scroll directive and NgModule for Angular Material 7.

## [0.1.0] - 2019-02-19

### Added

- Initial development version with `msInfiniteScroll`, percentage/pixel thresholds, and completion control. This tag was not published to npm.

[Unreleased]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v5.0.0...HEAD
[5.0.0]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v5.0.0-beta.3...v5.0.0
[5.0.0-beta.3]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v5.0.0-beta.2...v5.0.0-beta.3
[5.0.0-beta.2]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v5.0.0-beta.1...v5.0.0-beta.2
[5.0.0-beta.1]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v4.0.0...v5.0.0-beta.1
[4.0.0]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v3.0.1...v4.0.0
[3.0.1]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v2.1.1...v3.0.0
[2.1.1]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v1.2.1...v2.0.0
[1.2.1]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/HaidarZ/ng-mat-select-infinite-scroll/tree/v0.1.0
