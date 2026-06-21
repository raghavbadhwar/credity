## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2024-06-21 - Accessible Collapsible Content in Framer Motion
**Learning:** When conditionally rendering content with framer-motion (e.g., `showBreakdown && <motion.div>`), the toggle button needs `aria-expanded` and `aria-controls` pointing to an `id` on the `motion.div` to ensure screen readers can understand the interactive relationship and state, even if the element is removed from the DOM when closed.
**Action:** Always pair conditionally rendered expandable sections with `aria-expanded` on the trigger and an `id` mapping via `aria-controls` on the content container.
