## 2024-05-24 - Cryptographically Insecure Randomness in 2FA Backup Codes
**Vulnerability:** The 2FA backup codes in `CredVerseIssuer 3/server/services/two-factor.ts` are generated using `Math.random()`, which is a predictable PRNG and cryptographically insecure.
**Learning:** Security-sensitive values like backup codes, tokens, and secrets must never use `Math.random()` as an attacker could potentially predict the generated codes.
**Prevention:** Always use Node.js `crypto.randomInt()` or `crypto.randomBytes()` for cryptographically secure pseudo-random number generation.
