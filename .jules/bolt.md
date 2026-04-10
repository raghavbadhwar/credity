## 2024-04-10 - [Aggressive Polling Intervals]
**Learning:** In non-realtime dashboard components like `CredVerseRecruiter`'s Dashboard, aggressive `useQuery` polling intervals (e.g., 5000ms or 10000ms) cause unnecessary re-renders and network traffic.
**Action:** Extend refetch intervals to 30000ms - 60000ms on non-realtime dashboards to improve performance, BUT DO NOT change intervals explicitly marked for 'real-time' user experiences (e.g., `// Auto-refresh every 5 seconds for real-time feel`) or synchronous flows like identity verification where users are actively waiting.
