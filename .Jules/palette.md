## 2025-02-28 - Decorative Overlays Blocking Interactions
**Learning:** Absolute positioned decorative elements (like background blobs) can accidentally intercept pointer events if placed over interactive elements, making buttons unclickable.
**Action:** Always add `pointer-events-none` to decorative background elements that overlay content.
