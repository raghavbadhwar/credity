## 2024-04-16 - Prevent Excessive Polling on Dashboards
**Learning:** React Query defaults or developer-selected refetch intervals of 5000ms/10000ms cause severe and unnecessary API traffic and UI re-rendering in non-real-time dashboard components (e.g., `CredVerseRecruiter/client/src/pages/Dashboard.tsx`).
**Action:** Extend dashboard `refetchInterval` to 30000ms - 60000ms unless explicitly marked for real-time behavior.
