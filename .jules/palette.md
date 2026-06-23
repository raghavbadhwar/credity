## 2024-05-24 - Accessibility states for custom collapsible buttons
**Learning:** Custom interactive elements (like `button`s wrapping complex layouts) often lack proper ARIA bindings (e.g., `aria-expanded`, `aria-controls`) and focus-visible rings out of the box, making them inaccessible to screen readers and keyboard navigators.
**Action:** Always ensure custom toggleable components are bound using `aria-expanded` and have an `id` matching `aria-controls` for their content, along with an explicit `focus-visible` outline or ring class.
