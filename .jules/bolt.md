## 2025-05-09 - Synchronous Image Processing Optimization
**Learning:** In biometric liveness checks, processing large ImageData arrays on the main thread can cause severe UI stuttering because standard O(n) loops iterate over every pixel even after the detection threshold is met.
**Action:** When maintaining synchronous image processing logic, pre-calculate required thresholds and use early returns/breaks as soon as conditions are satisfied to save main thread execution time.
