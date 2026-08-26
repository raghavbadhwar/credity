## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.

## 2024-04-18 - Missing ARIA Labels on Icon-only Buttons
**Learning:** It is a common pattern in the UI to use the `<Button size="icon">` component for icon-only buttons without providing an `aria-label`, making them inaccessible to screen readers.
**Action:** Always ensure that icon-only buttons explicitly define an `aria-label` attribute describing their action (e.g., "Go back", "Copy DID").
