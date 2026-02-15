## 2024-05-23 - Decorative Overlays Blocking Interactions
**Learning:** Decorative absolute-positioned elements (like blurred blobs) without `pointer-events-none` can completely block clicks on interactive elements beneath them. This is a common pattern in modern UI designs using Tailwind.
**Action:** Always add `pointer-events-none` to decorative absolute/fixed elements that overlay content.
