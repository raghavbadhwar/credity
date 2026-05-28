## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2026-05-28 - Header Navigation Accessibility
**Learning:** Icon-only navigation buttons in global headers (like theme toggles or notification bells) frequently lack accessible names because their context is considered "obvious" visually. Screen readers announce these as just "button", severely hindering navigation for visually impaired users.
**Action:** Audit all global navigation regions (headers, sidebars) to ensure every icon-only interactive control has a descriptive `aria-label` or visually hidden text.
