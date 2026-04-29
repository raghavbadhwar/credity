## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2024-05-18 - Missing ARIA Labels on Icon Buttons

**Learning:** It is common in this app's components to use a `<Button size="icon">` component to render buttons that contain only icons. These components often lack an `aria-label` attribute, which is an accessibility issue.

**Action:** Whenever using a `<Button size="icon">` to render an icon-only button, always include an `aria-label` attribute to provide a descriptive text alternative for screen reader users.
