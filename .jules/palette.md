## 2024-05-18 - Missing ARIA label on copy credential hash button
**Learning:** Users with screen readers may struggle to understand the purpose of buttons that lack explicit ARIA labels, especially when the button's content is mostly icons or dynamic text (like a hash).
**Action:** Always verify that interactive elements, particularly those performing actions like copying to clipboard, have descriptive `aria-label` attributes to ensure clear intent for screen readers.
