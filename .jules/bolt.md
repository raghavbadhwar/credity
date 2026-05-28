## 2024-05-28 - Main Thread ImageData Processing Optimization
**Learning:** Biometric liveness checks loop through ImageData arrays synchronously, which can block the main thread and cause UI stutter.
**Action:** Always implement early returns (or boolean flag loop exits) in O(n) synchronous pixel processing loops as soon as threshold conditions (like motion or face detection percentages) are met to minimize main thread blocking.
