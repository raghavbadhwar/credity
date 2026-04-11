## 2024-04-11 - Aggressive Polling Anti-Pattern
**Learning:** Aggressive default polling intervals (e.g., 5000ms) in `useQuery` on non-realtime dashboard components cause significant unnecessary React re-renders and excessive network requests in this architecture.
**Action:** Extend refetch intervals to 30000ms - 60000ms on dashboard stats to improve frontend performance, taking care to preserve short intervals where a "real-time" UX is explicitly intended.
