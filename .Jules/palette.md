## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.

## 2026-02-22 - Truncated Identifiers Interaction
**Learning:** Users frequently need to copy truncated identifiers (like Credential IDs or Hashes) which are often displayed as static text. Making them interactive copy buttons with clear visual feedback (icon change + tooltip) significantly reduces friction and prevents errors from manual selection.
**Action:** Whenever displaying a truncated ID or Hash, wrap it in a copy-to-clipboard button with an `aria-label` and visual confirmation state.
