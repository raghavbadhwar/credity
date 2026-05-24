## 2024-05-24 - Optimizing Synchronous ImageData Processing
**Learning:** In BlockWalletDigi, synchronous processing of ImageData arrays on the main thread can cause UI stutter if the loops iterate over all pixels needlessly.
**Action:** Always use early returns or breaks in O(n) loops processing large data structures like ImageData as soon as conditions/thresholds are met.
