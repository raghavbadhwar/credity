## 2024-05-20 - Insecure Randomness in Security Functions
**Vulnerability:** Used `Math.random()` to generate two-factor authentication backup codes.
**Learning:** `Math.random()` is not cryptographically secure and predictable, which could allow attackers to guess backup codes if they determine the random seed. This was missed because the function was just a helper at the bottom of the file.
**Prevention:** Always use the native `crypto.randomInt` module or `crypto.randomBytes` for generating security tokens, secrets, passwords, or backup codes.
