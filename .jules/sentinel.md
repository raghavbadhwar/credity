## 2024-05-18 - Insecure Random Number Generation for 2FA Backup Codes
**Vulnerability:** The 2FA backup codes generation function (`generateBackupCodes` in `CredVerseIssuer 3/server/services/two-factor.ts`) used `Math.random()` to generate codes.
**Learning:** `Math.random()` is not cryptographically secure and predictable, which can lead to attackers guessing the backup codes and bypassing 2FA.
**Prevention:** Always use Node.js native `crypto` module (e.g. `crypto.randomInt` or `crypto.randomBytes`) for generating security-sensitive values like tokens, backup codes, and passwords.
