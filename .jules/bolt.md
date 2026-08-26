## 2024-07-18 - Concurrent execution in bulk processing
**Learning:** Sequential processing in bulk operations creates unnecessary I/O or processing bottlenecks when tasks are independent.
**Action:** Always verify if iterative async processing (like bulk verification) can be parallelized using `Promise.all` to significantly reduce total execution time.
