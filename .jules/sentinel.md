## 2024-05-24 - Avoid Math.random() for security tokens
**Vulnerability:** Weak random number generation in security-sensitive tokens (e.g., 2FA backup codes).
**Learning:** `Math.random()` is not cryptographically secure and should never be used for generating security tokens, passwords, or backup codes. It uses predictable PRNG algorithms.
**Prevention:** Always use Node's native `crypto` module (e.g., `crypto.randomInt()`, `crypto.randomBytes()`) for generating secure tokens and random values.
