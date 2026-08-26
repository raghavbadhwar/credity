## 2025-05-15 - Early returns in synchronous image processing
**Learning:** In BlockWalletDigi, biometric liveness checks process massive ImageData arrays synchronously on the main thread (e.g., checking every pixel in a 640x480 frame for motion or skin tones). Iterating over all pixels completely blocks the UI thread causing stutter during the 5 FPS detection loop.
**Action:** Always implement early returns or boolean flags in O(n) image processing loops as soon as the required threshold (e.g., 2% motion, 15% skin pixels) is met to skip unnecessary iterations and prevent UI stutter.
