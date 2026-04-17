## 2024-05-18 - Optimize useQuery Polling Intervals
**Learning:** Aggressive default polling intervals (e.g., 5000ms, 10000ms) on non-realtime dashboard components trigger unnecessary frequent API calls and React re-renders, causing performance bottlenecks.
**Action:** Extend `refetchInterval` to 30000ms-60000ms on non-critical dashboard queries while preserving fast polling only for explicit real-time features.
