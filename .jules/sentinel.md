## 2024-06-28 - Insecure Random Number Generation for 2FA Backup Codes
**Vulnerability:** 2FA backup codes were generated using `Math.random()`, which is not cryptographically secure.
**Learning:** `Math.random()` generates predictable sequences, making backup codes vulnerable to guessing attacks.
**Prevention:** Always use `crypto.randomInt()` or `crypto.randomBytes()` from the built-in `crypto` module for generating security-sensitive values.
