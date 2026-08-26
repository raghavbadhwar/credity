## 2024-05-15 - Polling Intervals vs Real-time UX
**Learning:** Aggressive default polling intervals in useQuery (5000ms) on dashboard components cause unnecessary re-renders and backend load, but some are explicitly intended for real-time UX (e.g., identity verification flows or live feeds).
**Action:** Always check context and comments before extending refetchIntervals. Optimize non-realtime dashboard stats to 30000ms-60000ms, but preserve intervals explicitly marked for 'real-time' or synchronous user flows to avoid degrading intended functionality.
