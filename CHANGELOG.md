# Changelog

## 6.0.0-next.0 — 2026-11-14

- Support Angular/Material 15.2–22, built with the Angular 15.2 compiler and tested on each supported major.
- Add direct standalone directive imports while retaining the NgModule wrapper.
- Add an optional `loading` input and honor configuration changes while open.
- Cancel panel listeners, delayed initialization, and pending scroll events on close/destruction.
- Calculate thresholds from real panel dimensions and preserve scroll position when pages append.
- Check opening/short-list boundaries with bounded automatic requests; validate threshold/debounce inputs.
- Add regression tests and CI checks against the packaged library.
- Document caching, selection retention, and Material's keyboard-navigation limitation.

## 5.0.0-beta.3 — 2025-06-26

Guard scroll handling when the event target no longer exists.
