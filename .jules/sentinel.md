## 2024-05-24 - Insecure 2FA Backup Code Generation
**Vulnerability:** Used `Math.random()` to generate two-factor authentication backup codes in `CredVerseIssuer 3/server/services/two-factor.ts`.
**Learning:** `Math.random()` is not a cryptographically secure pseudo-random number generator (CSPRNG), making the backup codes potentially predictable and weakening the 2FA protection.
**Prevention:** Strictly use Node's native `crypto` module (e.g., `crypto.randomInt(chars.length)`) for generating security-sensitive values like backup codes, tokens, or passwords.