## 2024-05-22 - MemStorage Scalability
**Learning:** The `MemStorage` class in `BlockWalletDigi` simulates a database but uses O(N) lookups for core entities (Users, Credentials, Activities). As data grows, this becomes a bottleneck.
**Action:** When implementing in-memory storage mocks, always implement secondary indices (Maps) for frequently accessed foreign keys (e.g., `userId`) to ensure O(1) or O(K) performance.
