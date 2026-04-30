## 2025-04-30 - Main Thread Biometric Loops
**Learning:** In BlockWalletDigi, biometric liveness checks (e.g., use-face-detection.ts) perform intensive synchronous pixel-by-pixel comparisons on ImageData arrays on the main thread at 5 FPS, causing UI stutter.
**Action:** Use early returns to break out of these O(n) loops as soon as thresholds are met to significantly reduce iterations.
