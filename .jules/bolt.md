## 2024-05-24 - Synchronous ImageData Processing Stutters UI
**Learning:** In BlockWalletDigi, biometric liveness checks process `ImageData` arrays synchronously on the main thread. Scanning 300,000+ pixels without early returns blocks the UI for multiple frames.
**Action:** When maintaining this logic, ensure O(n) loops over ImageData use early returns or breaks as soon as detection thresholds are met to prevent UI stutter.
