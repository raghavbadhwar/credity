## 2024-05-18 - Concurrent Array Iteration Operations
**Learning:** In backend processing loops like importing multiple items, waiting on each asynchronously inside a loop sequentially can create unnecessary latency.
**Action:** Parallelize independent loop operations using Promise.all or Promise.allSettled.
