## 2024-05-18 - Concurrent Async Execution Bottleneck
**Learning:** Sequential `for...of` loops with `await` for independent tasks (like verifying multiple credentials) create a severe performance bottleneck because each task must wait for the previous one to finish. This scales linearly with O(n) and can significantly slow down bulk operations.
**Action:** Use `Promise.all()` to execute independent async tasks concurrently whenever order of execution doesn't matter, drastically reducing total execution time for bulk operations.
