# Known limitations

## Active keyboard item on appended options

Material's single-select initialization can reset its active item to the selected option when its options QueryList changes. This is distinct from the selected value and panel scroll position. The directive preserves the viewport and does not change the consumer's selected value, but does not override Material's private key manager.

The browser matrix records `materialPreservesActiveItemOnAppend` separately from paging assertions. An Angular 19 reproduction currently reports `false` for both standalone and NgModule consumers: open with Option 0 selected, press End to load a page, and inspect the active option after append. See issue #6 and related #17. A public upstream API/fix is preferable to depending on private fields across eight framework majors.

This remains a valid limitation, not a resolved keyboard-focus claim. The prepared GitHub disposition must say so. No upstream issue or contributor message has been posted by this work.

## Resetting or filtering selected options

Material cannot display/select an option that is absent from the option list. Retain selected options or fetch them by ID when replacing pages. This state belongs to the consuming application; the directive does not own or cache option data.

## Nested scroll containers and legacy Material

The supported scroll target is the standard Material select panel. A nested scrolling div and `MatLegacySelect` are outside the current matrix. Keep options/optgroups in the panel's normal layout.
