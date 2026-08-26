## 2024-05-21 - Aggressive Default Polling Intervals
**Learning:** Dashboard components were using aggressive polling intervals (5000ms - 10000ms) for non-realtime data, causing unnecessary backend load and React re-renders.
**Action:** Extended polling intervals to 30000ms for non-critical dashboard queries, significantly reducing network traffic and frontend processing while maintaining acceptable data freshness.
