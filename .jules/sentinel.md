## 2024-05-24 - Weak Random Number Generation for 2FA Backup Codes
**Vulnerability:** Weak random number generation using `Math.random()` in 2FA backup code generation.
**Learning:** `Math.random()` generates predictable sequences and is not cryptographically secure. Relying on it for generating sensitive items like 2FA backup codes could allow an attacker to predict codes.
**Prevention:** Always use a cryptographically secure pseudorandom number generator (CSPRNG) like Node.js's `crypto.randomInt` or `crypto.randomBytes` when generating security tokens, passwords, or backup codes.
