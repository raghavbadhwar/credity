## 2025-04-19 - Extend overly aggressive useQuery polling intervals
**Learning:** Aggressive default polling intervals in useQuery (e.g., 5000ms, 10000ms) on non-realtime dashboard components cause unnecessary re-renders.
**Action:** Extend refetch intervals to 30000ms - 60000ms to improve performance, while maintaining faster intervals for explicitly marked real-time user experiences.
