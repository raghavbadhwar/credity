## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.

## 2024-07-03 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Found multiple icon-only buttons across components (`sidebar.tsx`, `qr-scanner.tsx`, `share-modal.tsx`) that lack screen reader context, specifically missing `aria-label`s. This is a crucial accessibility pattern specific to the wallet application's UI components.
**Action:** Always ensure any `size="icon"` button component has an associated `aria-label` or `title` describing its function to assistive technologies.
