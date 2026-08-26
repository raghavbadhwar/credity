## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.

## 2024-06-30 - Dynamic Builder Canvas Accessibility
**Learning:** In canvas or drag-and-drop builder interfaces, dynamically generated elements often rely on icon-only buttons for actions like deletion or settings. Without explicit `aria-label` attributes and keyboard focus indicators, these controls become completely invisible to screen readers and difficult to use for keyboard navigators.
**Action:** Always verify that interactive elements on custom canvas components have proper `aria-label` (or `aria-labelledby`), `title` tooltips for hover, and explicit `focus-visible` styling.
