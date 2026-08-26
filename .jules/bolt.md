## 2025-07-23 - Use bounded concurrent batch processing for queue iterations
**Learning:** Sequential queue item processing involving I/O waits severely limits throughput for bulk issuance tasks. Replacing `for(item)` loops with `await Promise.all()` over chunks unlocks parallelism.
**Action:** When optimizing long-running bulk loop operations, use chunking (e.g. batch size of 10) to safely harness `Promise.all` speed-ups without risking DB or API connection limits. Handle item exceptions individually within the `.map` so the overall batch doesn't abort early.
