## 2024-07-15 - Concurrent Batch Processing
**Learning:** Sequential processing in bulk jobs (like credential issuance) creates a major bottleneck when each iteration involves async operations like DB calls or external requests.
**Action:** Use Promise.all with batching for bulk operations instead of sequential loops to maximize throughput while avoiding memory overload.
