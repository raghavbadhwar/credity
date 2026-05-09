## 2025-05-09 - Hardcoded Default User ID Enabling IDOR
**Vulnerability:** Systemic IDOR across endpoints due to unauthenticated requests defaulting to user ID 1 via parseInt(req.query.userId) || 1.
**Learning:** Hardcoding default identities as fallbacks for missing request parameters completely bypasses authorization and allows full account takeover or unauthorized data access.
**Prevention:** Enforce strict authentication middleware and always extract the user ID securely from verified token payloads (req.user?.userId).
