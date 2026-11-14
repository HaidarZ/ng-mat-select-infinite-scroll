# Prepared GitHub dispositions

Drafts only; no comments, closures, or reviews have been sent. Fill in actual published version/PR links before sending. A local fix is not yet available to npm users.

| Item | Evidence and proposed disposition |
| --- | --- |
| #62 Angular 19 | Required Angular 19 latest/minimum consumer checks with normal peer resolution. Resolve only after the verified candidate/stable package is published and its install instructions are linked. |
| #49 shared HTTP | Application data-service recipe in RECIPES.md; optional loading guard prevents overlap within a select. Answer as integration guidance after publication. |
| #43 removed export | Current implementation no longer imports or assumes SELECT_ITEM_HEIGHT_EM. Modern consumers are tested; historical error versions remain unknown. Provide migration table and ask for exact versions if still failing; do not claim all historical peers are tested. |
| #34 nested div | Panel is the supported scroll container; wrappers that scroll independently are out of scope. Explain supported options/optgroups and request a valid reproduction if panel scrolling still fails. |
| #21 factory export | Likely historical compiler/runtime mismatch, not reproduced by current consumers. Provide exact compatibility/install table and request version details before claiming a fix. |
| #19 lost selection | Runnable demo and browser test retain selected records while changing search/pages. Explain application data ownership and that compareWith alone cannot restore removed records. |
| #17 upward jump | Regression checks compare actual scrollTop before/after append. Explain viewport preservation separately from the active keyboard-item limitation. |
| #16 repeated selection | Browser matrix replays selecting 4, 6, and 8 with reopen, then verifies further paging. Resolve after publication and final matrix evidence. |
| #9 preselected last item | Browser matrix opens with the last item of the initial page selected and verifies another page loads without a new scroll. Resolve after publication. |
| #6 keyboard/search | Keyboard paging is tested, but Material can still reset its active item after append. Keep the focus portion open/upstream; link search/cancellation guidance. Do not claim this report fully fixed. |
| PR #56 | Do not merge the mixed 19.x builder/15.x compiler update. Explain the isolated floor builder and separate modern demo; close as superseded only after replacement is merged and dependency dispositions are linked. |
| PR #59 | Same toolchain mismatch; replacement aligns each workspace and verifies package consumers. Close as superseded after replacement lands. |

## Comment drafts

### Compatibility (#62)

The 6.0 candidate includes Angular 19 in its required consumer checks, using the same tarball tested across the supported Angular/Material versions. The checks cover normal npm installation, production compilation, standalone/NgModule imports, and browser paging. Once the candidate is published, the compatibility table will name the exact version and installation command; no peer-dependency bypass should be needed. Publication/version links are pending.

### Paging/reopening (#9, #16, #17)

The revival implementation checks opening boundaries, cancels listeners and pending callbacks on close, and preserves the viewport when options append. Regression scenarios cover this report's sequence. The fix is currently local; I will link the published package and passing consumer evidence before marking it released. Material's active keyboard-item reset is tracked separately.

### Shared calls (#49)

The directive signals when a page is needed; HTTP sharing belongs in an application data service. The new recipe shares and caches requests by query/offset/limit, evicts failures for retry, and keeps each select's loading/offset state independent. The optional loading input also prevents overlapping requests within a select. Documentation/publication links are pending.

### Remaining keyboard behavior (#6)

The viewport and paging changes are covered by regression checks, but Material can still move the active item back to the selected option when its options change. The implementation deliberately avoids private key-manager fields across framework versions. This portion remains a valid limitation; the compatibility evidence records it rather than claiming a complete keyboard fix. Search/reset/cancellation is documented as an application integration.

### Dependency PRs (#56, #59)

Thanks for the dependency update. This PR raises build-tool majors without aligning the Angular compiler/TypeScript versions. The revival replaces that mixed toolchain with an isolated compiler at the library's minimum Angular version plus independent consumer/demo toolchains. I will link the merged replacement and dependency assessment before closing this as superseded.

Closed PR #60 supplied useful Angular 19 migration context. Credit its author, nicubucalaete, for the prior contribution without claiming that the old PR was merged or that it supplied the current regression suite.
