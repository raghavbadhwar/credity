# Sentinel's Journal

## 2026-02-13 - Mass Assignment / Privilege Escalation
**Vulnerability:** User registration endpoint destructured `req.body` directly and passed `role` field to user creation, allowing clients to inject `role: 'admin'`.
**Learning:** Destructuring request bodies without whitelisting properties is dangerous, especially when passing data to ORM or creation methods. Express endpoints often trust `req.body` too much.
**Prevention:** Always explicitly select only allowed fields from request body, or use validation schemas (like Zod) that strip unknown or forbidden keys before usage.
