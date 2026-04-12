## 2024-04-12 - Dashboard Polling Anti-Pattern
**Learning:** Found an aggressive polling interval pattern in `CredVerseRecruiter`'s `Dashboard.tsx` (5s and 10s) on non-realtime dashboards. This causes unnecessary background network requests and React re-renders, degrading performance.
**Action:** Extend `refetchInterval` to 60000ms (1 minute) for non-realtime dashboard metrics. Be careful not to alter intervals explicitly marked as real-time in comments.
