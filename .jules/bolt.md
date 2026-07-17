## 2024-05-15 - Concurrent Data Fetching
**Learning:** Sequential await statements on independent database queries cause unnecessary request latency, which is a common anti-pattern in Express route handlers.
**Action:** Always use Promise.all to fetch independent data sources concurrently before performing logic that depends on them.
