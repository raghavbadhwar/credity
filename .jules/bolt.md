## 2024-07-28 - Concurrency in Bulk Issuance
**Learning:** Sequential processing in bulk issuance acts as a major performance bottleneck for large datasets (e.g., thousands of credentials). Unbounded Promise.all over large arrays can exhaust resources like memory or DB connections.
**Action:** Always implement bounded concurrency by chunking large arrays into smaller batches (e.g., 10 items) and using Promise.all inside the chunk loop. This balances performance gains from parallel execution with safe resource usage.
