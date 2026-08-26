## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2024-06-17 - Add ARIA labels to icon-only buttons
**Learning:** Found several icon-only buttons across modal dialogs (share-modal), overlays (qr-scanner), and sidebars that lacked accessible names (`aria-label`). While some buttons visually explain their purpose (e.g., an 'X' icon for close), screen reader users are left without context, decreasing the app's accessibility score and usability. Adding `aria-label` and `title` to these instances provides necessary context and native tooltips.
**Action:** When implementing icon-only buttons, consistently include `aria-label` and `title` attributes.
