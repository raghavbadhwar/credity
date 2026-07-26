## 2025-03-01 - Optimizing Credential Verification
**Learning:** Sequential loops for I/O bound operations (like bulk credential verification which calls remote endpoints and databases) are a major bottleneck.
**Action:** Always replace sequential asynchronous operations in loops with chunked `Promise.all` implementations when dealing with lists to maximize concurrency without overwhelming the system or database connections. Wrap inner promises in `try/catch` to ensure robust error handling.
