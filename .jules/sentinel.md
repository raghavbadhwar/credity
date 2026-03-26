## 2024-03-26 - Fix weak random number generation for 2FA backup codes
**Vulnerability:** Weak random number generation using `Math.random()` in 2FA backup codes generation.
**Learning:** `Math.random()` is not cryptographically secure and can be predicted, leading to easily guessable 2FA backup codes.
**Prevention:** Use cryptographically secure random number generators like `crypto.randomInt()` or `crypto.randomBytes()` for sensitive tokens and codes.