## 2025-04-09 - Insecure Random Number Generation for 2FA Backup Codes
**Vulnerability:** The `generateBackupCodes` function in `CredVerseIssuer 3/server/services/two-factor.ts` was using `Math.random()` to select characters for backup codes.
**Learning:** `Math.random()` is not cryptographically secure and can be predictable, which compromises the security of 2FA backup codes used for authentication.
**Prevention:** Always use a cryptographically secure pseudo-random number generator (CSPRNG) like Node's `crypto.randomInt` or `crypto.getRandomValues` when generating security tokens, passwords, or backup codes.
