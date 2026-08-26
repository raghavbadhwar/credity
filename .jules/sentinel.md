## 2024-05-24 - IDOR Vulnerability in Wallet Routes
**Vulnerability:** IDOR in wallet routes defaulting unauthenticated requests to user ID 1 via parseInt(req.query.userId) || 1.
**Learning:** Hardcoded fallbacks on user input parameters in routing bypass authorization entirely.
**Prevention:** Apply authMiddleware and extract user ID directly from the validated token payload (req.user.userId).
