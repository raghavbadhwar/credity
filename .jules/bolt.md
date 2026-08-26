## 2025-05-18 - Optimized motion detection

**Learning:** In BlockWalletDigi biometric liveness checks process `ImageData` arrays synchronously on the main thread.
**Action:** When maintaining this logic, ensure O(n) loops use early returns as soon as thresholds are met to prevent UI stutter.
