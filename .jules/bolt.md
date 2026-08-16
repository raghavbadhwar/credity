## 2024-04-04 - Optimize React Query Polling Intervals
**Learning:** Aggressive default polling intervals in useQuery (e.g., 5000ms, 10000ms) on non-realtime dashboard components cause unnecessary re-renders and over-fetching.
**Action:** Extend refetch intervals to 30000ms - 60000ms to improve client performance and reduce backend load.
