## 2024-04-25 - Dashboard Polling Intervals
**Learning:** Default aggressive `refetchInterval` in react-query (e.g., 5000ms) on dashboard summary data causes unnecessary re-renders and heavy backend API load without significantly improving UX for non-realtime metrics.
**Action:** Extend dashboard intervals to 30000ms-60000ms unless the feed explicitly requires real-time/synchronous updates.
