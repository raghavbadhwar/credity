## 2024-07-13 - [Weak PRNG for Security Codes]
**Vulnerability:** Weak PRNG (`Math.random()`) was used to generate 2FA backup codes.
**Learning:** `Math.random()` is not cryptographically secure and predictable, which weakens the security of backup codes.
**Prevention:** Always use `crypto.randomInt()` or `crypto.randomBytes()` for generating security tokens, secrets, or codes.
