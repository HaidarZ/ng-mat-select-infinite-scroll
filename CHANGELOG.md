# Changelog

## 6.0.0-next.0 — unreleased

- Target Angular/Material 15.2–22 with one floor-compiled package and per-major/minimum-version consumer checks.
- Add direct standalone directive imports while retaining the NgModule wrapper.
- Add an optional `loading` input and honor configuration changes while open.
- Cancel panel listeners, delayed initialization, and pending scroll events on close/destruction.
- Calculate thresholds from real panel dimensions and preserve scroll position when pages append.
- Check opening/short-list boundaries with bounded automatic requests; validate threshold/debounce inputs.
- Restore meaningful regression tests, tarball consumer/browser checks, and validated release tooling.
- Document selection retention, shared request caching, and the remaining Material active-keyboard-item limitation.

## 5.0.0-beta.3 — 2025-06-26

Guard scroll handling when the event target no longer exists.
