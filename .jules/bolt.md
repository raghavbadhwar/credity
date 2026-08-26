## 2024-05-23 - Use Promise.all for concurrent bulk imports
**Learning:** Sequential `for...of` loops performing network operations (e.g., `pullDocument` and `storeCredential`) in bulk API routes cause unnecessary delays and block the response.
**Action:** Always replace sequential async loops with `Promise.all` mapping over the array to execute tasks concurrently when importing multiple items, significantly reducing total response time.
