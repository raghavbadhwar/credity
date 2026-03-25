## 2024-03-25 - Secure Random Number Generation for 2FA Backup Codes
**Vulnerability:** Weak random number generation using Math.random() for 2FA backup codes.
**Learning:** Math.random() is not cryptographically secure, making it possible to predict backup codes.
**Prevention:** Always use the crypto module (crypto.randomInt) instead of Math.random() for security-critical functions like generating backup codes.
