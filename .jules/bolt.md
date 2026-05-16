## 2024-05-16 - Early returns in synchronous image processing
**Learning:** Synchronously processing `ImageData` arrays on the main thread for biometric liveness checks blocks the UI. Since the checks only require passing a minimum percentage threshold, iterating over the entire array is wasteful.
**Action:** Always implement early returns/breaks in O(n) loops over large datasets as soon as the required threshold is met to prevent unnecessary processing and UI stutter.
