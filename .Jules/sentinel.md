## 2025-01-01 - Fix weak PRNG in backup codes
**Vulnerability:** Weak PRNG used for generating backup codes.
**Learning:** `Math.random` is predictable and not cryptographically secure, which is dangerous for generating security codes like 2FA backup codes.
**Prevention:** Always use the `crypto` module (e.g., `crypto.randomInt`) for generating security-sensitive random values.
