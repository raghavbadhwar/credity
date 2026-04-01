## 2024-04-01 - Default useQuery Polling Over-Fetching
**Learning:** Aggressive default polling intervals (e.g. 5000ms, 10000ms) on dashboard components across workspaces significantly degrade client performance and overload backend verification services without providing meaningful UX benefits in most non-realtime views.
**Action:** When creating or reviewing dashboards that fetch verification statistics or recent claims, strictly enforce longer refetch intervals (e.g., 30s to 60s) unless sub-second realtime activity is an explicit product requirement.
