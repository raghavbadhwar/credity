## 2024-05-24 - Early Returns in Main Thread Processing
**Learning:** Biometric liveness checks process ImageData arrays synchronously on the main thread in a loop, which can cause UI stutter.
**Action:** When maintaining this logic, ensure O(n) loops use early returns as soon as thresholds are met to prevent unnecessary processing and UI stutter.
