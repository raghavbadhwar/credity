## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.

## 2026-02-22 - Icon-only Buttons ARIA Labels
**Learning:** The UI extensively uses `size="icon"` on the `<Button>` component without providing `aria-label` attributes. This is an accessibility issue for screen reader users as they lack context for actions like copying links, managing connections, or toggling themes.
**Action:** Always ensure any icon-only button (especially those with `size="icon"`) includes an `aria-label` describing its action.
