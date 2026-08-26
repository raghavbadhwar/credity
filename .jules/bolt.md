## 2025-04-21 - Reduced unnecessary dashboard polling
**Learning:** Aggressive default polling intervals in useQuery (e.g., 10000ms) on non-realtime dashboard components cause unnecessary backend load and React re-renders.
**Action:** Extended refetch intervals to 60000ms to improve performance without significantly affecting user experience.
