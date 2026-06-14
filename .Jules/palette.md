## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.

## 2026-02-22 - Missing ARIA Labels on Navigation and Action Buttons
**Learning:** Icon-only buttons used for primary navigation and actions (e.g., Theme Toggle, Help, Notifications, User Profile, Copy to Clipboard) are completely inaccessible to screen readers without ARIA labels. This breaks key navigation and functionality for visually impaired users.
**Action:** Always audit headers, navigation bars, and modal actions for icon-only buttons. Ensure every `<Button size="icon">` or similar element has a descriptive `aria-label` that clearly explains its function (e.g., "Toggle theme", "Help", "User account").
