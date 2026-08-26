## 2024-05-24 - Main Thread Biometric Processing
**Learning:** In BlockWalletDigi, biometric liveness checks iterate over large `ImageData` arrays (e.g., 640x480 pixels) synchronously on the main thread, which can cause UI stutter during continuous video capture.
**Action:** When maintaining biometric logic, always optimize O(n) pixel iteration loops with early returns as soon as required thresholds (like motion or face detection percentages) are met to prevent blocking the main thread unnecessarily.
