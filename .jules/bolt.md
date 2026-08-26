## 2024-05-15 - React Query Polling Optimization
**Learning:** Default dashboard components in the frontend rely on overly aggressive `refetchInterval` settings (5s and 10s) in `useQuery` hooks. This causes unnecessary network load, database strain, and constant re-renders for data that doesn't have strict real-time requirements.
**Action:** Identify and extend aggressive `refetchInterval` settings in dashboard `useQuery` calls to 30000ms-60000ms when absolute real-time updates aren't critical.
