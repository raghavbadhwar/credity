## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2026-05-01 - Header & Sidebar Accessibility
**Learning:** Icon-only buttons used for primary navigation and settings (e.g., Theme, Help, Notifications, Mobile Menu, User Profile) often lack intrinsic semantic meaning for screen readers. While visual users recognize a "Moon" or "Bell" icon, screen readers will read nothing or announce generic button states if `aria-label` is not provided.
**Action:** Always add descriptive `aria-label` attributes to `<Button size="icon">` components, specifically focusing on global layout elements like Headers and Sidebars where screen reader users first navigate.
