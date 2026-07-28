## 2025-05-18 - Math.random() in 2FA backup codes
**Vulnerability:** Weak random number generation using `Math.random()` to generate two-factor authentication backup codes.
**Learning:** Standard Math.random() is not cryptographically secure and can be predicted, potentially allowing an attacker to guess backup codes.
**Prevention:** Always use a cryptographically secure pseudo-random number generator (CSPRNG) such as Node.js `crypto.randomInt` or `crypto.randomBytes` for security-sensitive operations like token, password, or backup code generation.
