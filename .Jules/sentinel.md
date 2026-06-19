## 2024-05-24 - Weak Random Number Generation in 2FA Backup Codes
**Vulnerability:** Weak PRNG (`Math.random()`) used for generating 2FA backup codes.
**Learning:** Generating security-sensitive values with `Math.random()` allows attackers to potentially predict the values if they can determine the PRNG state, as it's not cryptographically secure.
**Prevention:** Always use `crypto.randomInt()` or `crypto.randomBytes()` for generating tokens, backup codes, or passwords in Node.js backend services.
