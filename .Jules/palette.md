## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2025-05-18 - Tooltips and ARIA Labels for Icon-Only Buttons
**Learning:** Icon-only buttons without labels cause accessibility issues for screen readers. Using standard Tooltip components alongside `aria-label`s provides immediate clarity for all users while retaining a clean UI.
**Action:** Always wrap icon-only buttons with Tooltips and explicit `aria-label` attributes to ensure keyboard, mouse, and screen reader accessibility.
