## 2024-05-26 - Add early returns to synchronous image processing loops
**Learning:** Processing large `ImageData` arrays (e.g. 640x480 pixels) synchronously on the main thread for biometric liveness checks causes noticeable UI stutter if the loops process every pixel, even after thresholds are met. Labeled break statements inside nested loops are forbidden by the strict `no-labels` lint rule.
**Action:** Always add early returns or use boolean flags in nested loops for synchronous image processing once the required confidence threshold (e.g., motion or skin pixel count) is achieved.
