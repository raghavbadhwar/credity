## 2024-03-24 - [In-Memory Storage Bottlenecks]
**Learning:** `BlockWalletDigi` uses `MemStorage` as its primary production data store (backed by async persistence). This means "database" optimizations like SQL indexes don't apply; instead, manual in-memory Hash Map indices are required to prevent O(N) scans on every read.
**Action:** When optimizing storage in this repo, first identify if the layer is in-memory or SQL-based. For `MemStorage`, implement manual secondary indices (Maps) for any field used in lookups.
