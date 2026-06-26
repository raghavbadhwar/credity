## 2024-05-24 - Cryptographically Insecure Backup Codes
**Vulnerability:** 2FA backup codes were generated using the predictable `Math.random()` function.
**Learning:** `Math.random()` is not cryptographically secure and can allow attackers to predict security-sensitive tokens or IDs.
**Prevention:** Always use the built-in `crypto` module (e.g., `crypto.randomInt()`) or equivalent secure CSPRNGs for generating authentication tokens, backup codes, or session IDs.
