## 2024-06-21 - Insecure Random Number Generation for Security Tokens
**Vulnerability:** Found Math.random() being used to generate 2FA backup codes. Math.random() is not cryptographically secure and can be predicted, allowing an attacker to guess valid backup codes.
**Learning:** Security-sensitive strings or tokens should never be generated using pseudo-random number generators like Math.random().
**Prevention:** Always use a cryptographically secure pseudo-random number generator (CSPRNG), such as crypto.randomInt() or crypto.randomBytes(), for any tokens, passwords, or IDs that have security implications.
