## 2024-06-24 - Interactive Elements Accessibility
**Learning:** Found a specific pattern where custom interactive elements like expanding sections and icon-only buttons omit critical screen reader context. The absence of `aria-expanded` and `aria-label` makes navigation confusing.
**Action:** Always add `aria-expanded` to custom collapsibles and `aria-label` to buttons containing only icons.
