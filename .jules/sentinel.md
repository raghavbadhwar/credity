## 2024-05-24 - Cryptographically Insecure Backup Code Generation
**Vulnerability:** 2FA backup codes were generated using `Math.random()`.
**Learning:** `Math.random()` uses a pseudo-random number generator that is not cryptographically secure, allowing attackers to potentially predict the backup codes and bypass 2FA.
**Prevention:** Always use Node.js's native `crypto` module (e.g., `crypto.randomInt` or `crypto.randomBytes`) when generating security-sensitive values.
