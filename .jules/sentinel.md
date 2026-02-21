## 2025-05-18 - Permissions Policy Blocking Features
**Vulnerability:** Core biometric features (face detection) were implicitly blocked by default security configurations when headers were enabled, leading to dead/unused security code.
**Learning:** Security headers like Permissions-Policy must be feature-aware. Simply copying 'secure defaults' (camera=()) breaks applications relying on modern browser APIs.
**Prevention:** Audit Feature-Policy/Permissions-Policy against app capabilities (grep for getUserMedia/camera) before applying strict headers.
