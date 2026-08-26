## 2025-12-07 - Add password validation to Recruiter registration
**Vulnerability:** The Recruiter portal registration endpoint (`/auth/register`) was completely missing the `validatePasswordStrength` check before hashing the password. This could allow users to create extremely weak passwords (e.g., '123').
**Learning:** Shared auth libraries might export validators, but they still need to be manually integrated in each endpoint across workspaces in a monorepo.
**Prevention:** Ensure new auth endpoints or workspaces inherit a unified controller rather than re-implementing registration logic independently.
