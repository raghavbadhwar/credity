## 2025-02-12 - Context Binding Gotcha with Concurrent Execution
**Learning:** When refactoring sequential loops to use `Promise.all` and `.map()` for concurrent execution of class methods, always use an arrow function (e.g., `.map(item => this.method(item))`) rather than passing the method reference directly (e.g., `.map(this.method)`) to ensure the `this` context is correctly preserved during execution.
**Action:** Always use arrow functions when mapping over array items and invoking instance methods within concurrent `Promise.all` execution.
