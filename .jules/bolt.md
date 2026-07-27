## 2024-05-18 - Queue Processor Optimization
**Learning:** Sequential processing in background queues for bulk credential issuance limits throughput significantly, even when underlying services support concurrency.
**Action:** Replace sequential loops (`for` with `await`) with chunked `Promise.all` batches in queue processors to utilize background concurrency while bounding resource usage (e.g., chunk size of 10).
