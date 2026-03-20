## 2024-05-15 - [Insecure Randomness for Token Generation]
**Vulnerability:** Found multiple instances where `Math.random().toString(36)` is used to generate IDs for security-sensitive contexts (like DisclosureTokens and ConsentLogs).
**Learning:** This is cryptographically insecure and predictable, allowing attackers to potentially guess or brute-force valid tokens, which could lead to unauthorized access to sensitive credential data or manipulating consent records.
**Prevention:** Always use cryptographically secure pseudo-random number generators (CSPRNG) like `crypto.randomBytes` or `crypto.randomUUID` for generating sensitive identifiers.
