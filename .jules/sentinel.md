## 2026-02-14 - Logic Flaw in Password Change

**Vulnerability:** The password change endpoint (`/auth/change-password`) had a logic flaw where `if (passwordHash && currentPassword)` was used to check if the current password should be verified. This allowed an attacker (or a user) to bypass the current password check simply by omitting the `currentPassword` field from the request body, effectively resetting the password without authorization.

**Learning:** Boolean logic combining existence checks (`passwordHash`) with input validation (`currentPassword`) can fail silently if the input is missing. If a condition (`passwordHash`) implies a requirement (`currentPassword`), that requirement must be enforced explicitly in a separate check or nested block, not combined with AND.

**Prevention:** Always validate input existence explicitly when a condition is met. Use guard clauses or explicit validation schemas (like Zod) that enforce dependencies between fields.
