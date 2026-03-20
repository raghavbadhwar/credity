
## 2024-03-20 - [O(C*N) Array Filters in Loop]
**Learning:** Found a pattern where an entire array of elements (N) is redundantly `.filter()`ed inside a loop of constant length (C categories), turning an O(N) grouping operation into an O(N * C) multi-pass filter.
**Action:** When calculating grouped aggregates over an array across predetermined categories, replace nested `.filter()` iterations with a single `Map` of accumulators processed in one O(N) pass.
