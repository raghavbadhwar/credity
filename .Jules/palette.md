## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2024-06-11 - ARIA Labels for Icon-Only Buttons
**Learning:** Icon-only buttons (like theme toggles and copy buttons) in the BlockWalletDigi components lack `aria-label`s, making them inaccessible to screen readers. This pattern is prevalent in `sidebar.tsx` and `share-modal.tsx`.
**Action:** When adding or reviewing icon-only buttons, always ensure an `aria-label` attribute is included to describe the action clearly.
