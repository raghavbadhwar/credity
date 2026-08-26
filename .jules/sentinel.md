## 2024-05-24 - Fix weak random number generation for 2FA backup codes
**Vulnerability:** 2FA backup codes were generated using the predictable `Math.random()` pseudo-random number generator.
**Learning:** Hardcoded or pseudo-random generation logic for security tokens can undermine cryptographic mechanisms. Native Math functions shouldn't be used for secrets.
**Prevention:** Always use cryptographically secure methods like `crypto.randomInt()` or `crypto.randomBytes()` when generating authentication tokens or passwords.
