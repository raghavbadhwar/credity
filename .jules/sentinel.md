## 2026-02-13 - [ESLint and Regex Literals]
**Vulnerability:** The `shared-auth` package uses strict ESLint rules (`no-useless-escape`) that conflict with the parser's requirement to escape forward slashes in regex literals inside character classes or elsewhere.
**Learning:** This conflict can cause CI failures even if the code is syntactically correct.
**Prevention:** Use `new RegExp()` constructor when a regex requires escaping characters (like `/`) that the linter incorrectly flags as useless in a literal context. This satisfies both the parser (runtime) and the linter (static analysis).
