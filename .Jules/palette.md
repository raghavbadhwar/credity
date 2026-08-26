## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2025-04-26 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Icon-only buttons (like help, notifications, and theme toggles) frequently lack `aria-label` attributes across different workspaces (Recruiter and Issuer components). Without `aria-label`, these controls are opaque to screen reader users since they don't have text content to announce. The `size="icon"` components are particularly prone to this.
**Action:** Consistently enforce the addition of descriptive `aria-label`s on any button lacking visual text (e.g., using `size="icon"`), particularly for utility actions in header navigation.
