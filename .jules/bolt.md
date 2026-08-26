## 2025-04-29 - Main Thread Image Processing Loop Bottleneck
**Learning:** The app performs synchronous pixel-by-pixel comparisons on `ImageData` arrays (e.g. 307,200 iterations for 640x480) on the main thread every 200ms during biometric liveness checks, which can cause UI stutter.
**Action:** Implemented early returns in pixel-processing loops to break out as soon as thresholds are met, reducing O(n) operations to O(threshold). For future complex image processing, consider Web Workers.
