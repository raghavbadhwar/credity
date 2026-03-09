## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.

## 2024-05-20 - Missing aria-label on Copy Buttons
**Learning:** Icon-only copy buttons frequently lack `aria-label` attributes across different applications, reducing accessibility for screen reader users trying to copy text like share links, backup keys, and wallet addresses.
**Action:** When implementing new copy functionality or reviewing existing code, always ensure a descriptive `aria-label` is added to icon-only buttons to clearly indicate the action.
