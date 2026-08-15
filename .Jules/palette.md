## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2024-05-04 - Unlabelled Icon Buttons in Core Layout
**Learning:** Found multiple instances of `<Button size="icon">` lacking `aria-label`s in the core `Header` layout component. This pattern of adding tooltips/icons without explicit screen reader accessible names seems common.
**Action:** When using or reviewing the `Button` component with `size="icon"`, always explicitly provide an `aria-label` property to ensure the button's action is announced to screen readers.
