## 2024-05-24 - Early Returns in Main Thread Image Processing
**Learning:** Biometric liveness checks frequently process large `ImageData` arrays synchronously on the main thread (e.g. 5fps video streams), leading to potential UI stutter if O(n) pixel iterations are exhausted.
**Action:** When maintaining image data processing loops, use required pixel thresholds and early returns (or early breaks for nested loops) to abort full-frame evaluations as soon as conditions are met, drastically reducing synchronous block time.
