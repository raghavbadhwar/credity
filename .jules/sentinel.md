## 2024-03-24 - Prevent IDOR in Student and Team API Endpoints
**Vulnerability:** IDOR vulnerability in students and team API endpoints. Database storage methods did not implicitly filter by `tenantId`.
**Learning:** In the CredVerse codebase, centralized tenant mapping tools set `req.tenantId` for authentication, but database storage methods (e.g., `getStudent`, `getTeamMember`) do not implicitly filter by `tenantId`.
**Prevention:** Route handlers must explicitly verify that the fetched resource's `tenantId` matches the authenticated `req.tenantId` before returning or mutating data.
