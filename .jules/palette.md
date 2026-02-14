## 2025-05-23 - Interactive Elements Blocked by Decorative Overlays
**Learning:** In `BlockWalletDigi`, decorative elements with `absolute inset-0` and visual effects (like blur) can intercept pointer events, making underlying buttons unclickable. This is invisible to visual inspection but breaks interaction.
**Action:** Always add `pointer-events-none` to decorative absolute overlays that sit on top of interactive content.
