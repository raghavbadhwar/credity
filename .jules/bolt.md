## 2024-05-22 - [Backend Performance] In-Memory Storage Indexing
**Learning:** `MemStorage` without secondary indices performs O(N) scans on every list operation, causing linear slowdown as data grows. Adding `Map<UserId, ItemIds[]>` reduces lookup to O(K) (where K is user's item count).
**Action:** Always implement secondary indices for frequent lookups (like `findByUserId`) in in-memory storage implementations, and crucially, rebuild them during state hydration (`importState`).

## 2024-05-22 - [Testing Strategy] Benchmarking in Restricted Environments
**Learning:** In environments with restricted network/dependencies where full test suites fail, creating a standalone, dependency-minimal benchmark script (using `performance.now()`) is the most reliable way to verify performance improvements and functional correctness of isolated modules.
**Action:** Prioritize writing a temporary benchmark script to validate optimizations when the main test runner is unreliable.
