## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2025-05-09 - Missing ARIA Labels on Icon Buttons
**Learning:** Icon-only buttons lacking `aria-label`s were found scattered across components in this app, severely degrading the experience for screen reader users by removing context.
**Action:** Always add `aria-label` attributes to any icon-only button to ensure semantic and accessible HTML, establishing an accessible foundation for the UI.
