## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.

## 2026-03-10 - Icon-Only Navigation Buttons
**Learning:** Icon-only buttons used for essential navigation features (like theme toggles, help, notifications, and menus) often lack `aria-label`s, rendering them inaccessible to screen readers. This pattern is prevalent in headers and sidebars.
**Action:** When auditing or building navigation components, always explicitly check for icon-only `<Button>` variants and ensure they have descriptive `aria-label` attributes to provide context.
