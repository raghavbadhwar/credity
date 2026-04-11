## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2026-04-11 - Settings Action Buttons Accessibility
**Learning:** Icon-only action buttons in developer/settings panels (like "Copy API Key" or "Rotate Key") are frequently missed during accessibility audits, making critical account management actions invisible to screen reader users.
**Action:** Always verify that generic `size="icon"` components in settings dashboards have explicit `aria-label`s mapping directly to their semantic action (e.g., "Copy [Resource]").
