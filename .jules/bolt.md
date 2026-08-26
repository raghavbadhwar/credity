## 2024-05-31 - Main Thread Stutter in Synchronous Image Processing
**Learning:** Biometric liveness checks iterating over raw ImageData arrays directly on the main thread cause significant UI stutter when doing a full pass (O(n)). Processing 640x480 frames synchronously limits app performance.
**Action:** Always short-circuit CPU-intensive main-thread O(n) loops (like image pixel analysis) by using early breaks/returns the moment detection thresholds are met.
