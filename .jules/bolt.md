## 2024-05-30 - Early Returns in Biometric Main Thread Processing
**Learning:** Biometric liveness checks process ImageData arrays synchronously on the main thread, and iterating over all pixels even after thresholds are met causes UI stutter and redundant computation.
**Action:** When maintaining or writing O(n) loops for image or data processing, ensure early returns or early loop breaks are used as soon as required thresholds are satisfied to prevent main thread blocking.
