## 2025-02-12 - Synchronous ImageData processing blocks main thread
**Learning:** In BlockWalletDigi, biometric liveness checks process ImageData arrays synchronously on the main thread, causing UI stutter if the loops process the entire frame.
**Action:** Always ensure O(n) loops over large datasets like ImageData use early returns as soon as thresholds are met to minimize main thread blocking.
