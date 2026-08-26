## 2024-06-07 - Improved Accessibility of interactive icons and elements
**Learning:** Found that custom layout components often omit `aria-label`s on icon-only buttons or toggles (such as the trust-score breakdown button and the mobile-nav disconnect). These present significant barriers to screen reader users despite looking correct visually.
**Action:** When creating or modifying button toggles or icon buttons, double-check that they either have visible descriptive text or an explicitly provided `aria-label`.
