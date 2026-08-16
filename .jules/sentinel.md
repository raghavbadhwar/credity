## 2024-05-24 - DOM-based XSS via innerHTML
**Vulnerability:** The inline HTML fallback page uses `innerHTML` to display URL parameters directly into the DOM (`params.get('name')` and `params.get('error')`), allowing an attacker to inject arbitrary scripts via Reflected XSS.
**Learning:** Even fallback pages or internal dashboards must treat URL parameters as untrusted input. Dynamically inserting user input or URL parameters into the DOM in Vanilla JS scripts must always use `textContent` instead of `innerHTML` to prevent DOM-based XSS.
**Prevention:** Always use `textContent` or proper sanitization libraries (like DOMPurify) when rendering user-controlled data in Vanilla JS.
