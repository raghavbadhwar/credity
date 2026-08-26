## 2024-06-28 - Map Iteration Overhead
**Learning:** Using `Array.from()` to iterate over Maps (e.g. `Array.from(map.entries())`) creates an unnecessary O(n) intermediate array, which increases memory allocations and garbage collection pressure in Node.js services.
**Action:** Always iterate directly over the Map iterator (e.g., `for (const [key, val] of map.entries())`) instead of converting it to an array first unless array methods like `.map` or `.filter` are strictly necessary before iteration.
