## 2024-10-24 - Map Iteration Allocation
**Learning:** Using Array.from(map.entries()) in loops creates unnecessary O(n) array allocations in memory.
**Action:** Always iterate directly over map.entries() with for...of loops for better memory efficiency.
