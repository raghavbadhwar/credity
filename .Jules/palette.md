## 2026-02-22 - Login Page Accessibility
**Learning:** Icon-only buttons on login screens are a common accessibility trap. Users with screen readers need clear context on what the button does, especially for authentication methods. Also, visual loading states during authentication provide critical feedback, preventing user frustration from repeated clicks.
**Action:** Always audit login screens for:
1. ARIA labels on biometric/icon buttons.
2. Distinct disabled/loading states during the authentication process.

## 2026-02-22 - Decorative Overlays
**Learning:** Decorative elements (like blurred backgrounds) positioned absolutely over interactive elements can intercept clicks, making the UI unresponsive. This is a critical usability failure.
**Action:** Always add `pointer-events-none` to decorative overlays that sit on top of other content.
## 2024-06-18 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Across the CredVerse app, several utility actions (theme toggle, copy to clipboard, close filters) use icon-only buttons without accessible names, causing them to be announced as unlabelled buttons by screen readers.
**Action:** Always verify that buttons lacking visible text content include descriptive aria-label and title attributes, and ensure collapsible panels use aria-expanded and aria-controls for proper screen reader announcements.
