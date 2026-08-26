## 2024-04-14 - Dashboard Polling Optimization
**Learning:** Aggressive default polling intervals in useQuery (e.g., 5000ms, 10000ms) on non-realtime dashboard components cause unnecessary API calls and re-renders, while some components explicitly require real-time updates.
**Action:** Extend refetch intervals to 30000ms - 60000ms for non-realtime dashboards, but always preserve aggressive polling intervals explicitly marked for 'real-time' user experiences to avoid degrading functionality.
