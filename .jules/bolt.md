## 2024-04-18 - Dashboard Polling Overhead
**Learning:** Aggressive default polling intervals (e.g., 5000ms, 10000ms) on non-realtime dashboard components cause unnecessary re-renders and network traffic.
**Action:** Extend refetch intervals to 30000ms - 60000ms for non-realtime queries, preserving aggressive polling only for explicitly marked real-time user experiences.
