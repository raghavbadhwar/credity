## 2025-05-03 - Liveness Detection Early Returns
**Learning:** Biometric liveness checks using synchronous pixel-by-pixel `ImageData` comparisons on the main thread at 5 FPS can cause significant UI stutter if the loops process the entire image buffer unnecessarily.
**Action:** Always implement early returns/breaks in O(n) array loops once functional thresholds (e.g. 2% motion, 15% skin pixels) are met to dramatically reduce main thread iterations.
