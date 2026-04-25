## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2024-04-25 - Missing ARIA Labels on Core Navigation Icons
**Learning:** Found multiple icon-only buttons (`<Button size="icon">`) without `aria-label` attributes in global layout components (`Header.tsx`, `Sidebar.tsx`). This completely hides critical actions (like Theme Toggle, User Profile, Mobile Menu) from screen readers, severely degrading basic accessibility.
**Action:** Establish a strict linting rule or component-level check to ensure any `<Button>` with `size="icon"` must have an `aria-label` attribute.
