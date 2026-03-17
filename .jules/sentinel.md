## 2024-05-24 - Secure random generation for 2FA backup codes
**Vulnerability:** 2FA backup codes were generated using `Math.random()`, which is a weak pseudo-random number generator and not cryptographically secure. This could theoretically allow an attacker to predict backup codes.
**Learning:** Security-sensitive values like 2FA backup codes must be generated using cryptographically secure methods like Node's `crypto` module.
**Prevention:** Use `crypto.randomInt` or `crypto.randomBytes` instead of `Math.random()` when generating secure tokens, codes, or IDs in backend services.
