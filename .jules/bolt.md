## 2024-07-24 - Optimize Redis Batch Processing

**Learning:** Unbounded sequential processing inside bulk background workers (like large queue handlers) will severely degrade performance by blocking progress updates and bottlenecking network requests, even when Redis connection is established. Bounded concurrency is highly efficient here.

**Action:** Whenever iterating over potentially large arrays of items making async network/DB calls in a worker, chunk them into smaller batches and process concurrent operations using `Promise.all()` over `.map()`. Ensure batch sizing bounds memory/connections.
