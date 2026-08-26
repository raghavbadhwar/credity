## 2024-05-28 - Optimize Bulk Issuance queue

**Learning:** When queue processing in `queue-service.ts` processes a large list of elements via a for-loop synchronously awaiting each element in sequence (`await processCredential(...)`), this becomes a severe performance bottleneck. It delays the completion of bulk jobs by increasing overall latency because tasks run completely serially, rather than simultaneously.

**Action:** Replaced sequential execution with bounded concurrency using `Promise.all` while chunking the workload (e.g. batch size of 10) to optimize bulk processing and safely constrain resource utilization.
