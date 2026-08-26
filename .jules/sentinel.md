## 2024-06-24 - Cryptographically Secure RNG for 2FA Backup Codes
**Vulnerability:** 2FA backup codes were being generated using `Math.random()`, which is a predictable pseudo-random number generator and cryptographically insecure.
**Learning:** Security-sensitive values must use a cryptographically secure random number generator (CSPRNG) like `crypto.randomInt()` or `crypto.randomBytes()`. Using `Math.random()` can lead to predictability, compromising the security of the backup codes.
**Prevention:** Ensure that all generation of secrets, tokens, backup codes, and IDs used in security contexts utilize the built-in `crypto` module methods.
