## 2024-05-24 - [Insecure Random Number Generation]
**Vulnerability:** Found `Math.random()` used for generating 2FA backup codes in `CredVerseIssuer 3/server/services/two-factor.ts` and transaction IDs in `CredVerseIssuer 3/server/services/digilocker.ts`.
**Learning:** Developers might unknowingly use `Math.random()` for convenience instead of cryptographically secure random number generators (CSPRNG), leading to predictable values which compromise security in sensitive contexts like authentication fallback.
**Prevention:** Enforce strict linting rules or code reviews to prohibit `Math.random()` usage in security-sensitive modules, ensuring `crypto` native modules are always used for secret/token generation.
