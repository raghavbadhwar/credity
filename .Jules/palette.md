## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.

## 2026-02-22 - Accessible Disclosure Components
**Learning:** Collapsible "accordion" style content sections often miss proper ARIA wiring, making them invisible or confusing to screen readers. Focus styles on the trigger button are also frequently omitted, breaking keyboard navigation.
**Action:** Always ensure disclosure buttons have `aria-expanded`, `aria-controls`, and strong `focus-visible` styles to guarantee they are discoverable and usable by everyone.
