## 2024-05-24 - [Fix Insecure 2FA Backup Codes]
**Vulnerability:** Used Math.random() to generate 2FA backup codes.
**Learning:** Math.random() is not cryptographically secure, allowing potential prediction of backup codes which bypass 2FA.
**Prevention:** Always use cryptographically secure methods like crypto.randomInt() or crypto.randomBytes() for sensitive authenticators.
