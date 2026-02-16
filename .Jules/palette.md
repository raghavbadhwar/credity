## 2026-02-16 - [Biometric Login Feedback]
**Learning:** Users need immediate feedback during biometric authentication delays to prevent frustration and repeated clicks.
**Action:** Implement `isAuthenticating` state to disable buttons and show a `Spinner` on the primary CTA, and add `aria-label` to icon-only triggers.
