## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2026-02-23 - Missing Context on Icon-Only Header Actions
**Learning:** Across the monorepo's applications (Issuer and Recruiter), top-level header actions (like Help, Notifications, User Menu, and Theme Toggle) consistently use icon-only `<Button>` components without any accessible names (`aria-label`) or tooltips (`title`). This prevents screen reader users from understanding what these primary navigation actions do, creating a significant accessibility barrier in the core app shell.
**Action:** Always verify that icon-only buttons, especially in global layouts like headers and sidebars, have explicit `aria-label` and `title` attributes (or visually hidden text) to ensure they are perceivable by all users.
