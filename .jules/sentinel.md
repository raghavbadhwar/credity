## 2025-04-01 - Weak Random Number Generation
**Vulnerability:** Found `Math.random()` used for generating 2FA backup codes in `CredVerseIssuer 3/server/services/two-factor.ts`.
**Learning:** `Math.random()` is not cryptographically secure and predictable, which makes brute-forcing or predicting backup codes possible. This pattern is likely present across the application.
**Prevention:** Always use Node.js `crypto.randomBytes` or `crypto.randomInt` when generating secure tokens, backup codes, passwords, or salts.
