## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.

## 2026-02-22 - Missing ARIA Labels on Icon Buttons
**Learning:** It is a common pattern across this monorepo to use `<Button size="icon">` for visually sparse, icon-only buttons. These frequently lack `aria-label` attributes, rendering them invisible or confusing to screen reader users because they have no accessible name.
**Action:** When auditing or implementing UI, explicitly look for `<Button size="icon">` usages and enforce the inclusion of `aria-label` attributes to ensure keyboard and screen reader accessibility aligns with the intended visual affordance.
