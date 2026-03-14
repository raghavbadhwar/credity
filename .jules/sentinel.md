## 2024-05-24 - Fix insecure randomness in 2FA backup codes
**Vulnerability:** The `generateBackupCodes` function in `CredVerseIssuer 3/server/services/two-factor.ts` used `Math.random()` to generate backup codes.
**Learning:** `Math.random()` is not cryptographically secure and can be predictable, potentially allowing an attacker to guess 2FA backup codes.
**Prevention:** Always use a cryptographically secure pseudo-random number generator (CSPRNG), such as Node's native `crypto.randomInt` or `crypto.randomBytes`, when generating security-sensitive values like tokens, passwords, or backup codes.
