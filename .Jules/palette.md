## 2025-05-20 - Invalid Interactive Nesting in Navigation
**Learning:** `wouter`'s `<Link>` component renders an anchor (`<a>`) tag. Nesting other interactive elements like `<button>` or `<a>` inside it creates invalid HTML and accessibility issues.
**Action:** Use non-interactive wrappers like `<div>` or `<span>` inside `<Link>`, or apply styles directly to the `<Link>` component.
