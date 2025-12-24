# Objective & Scope
- Goal: Align gateway UI to PRD MVP covering auth, verification, trust score, credentials, platform connections, and notifications.
- Non-goals: Backend implementation is out of scope; no mobile app work in this repository.

# Information Architecture (routes)
- `/` : Landing/redirect.
- `/login` : Google OAuth, Email OTP, Phone OTP; prompt PIN setup after first login; remember-device for 30 days.
- `/verify` : Wizard with liveness (camera placeholder), document scan/upload (front/back), face match status, DigiLocker CTA, review/submit; show progress, retries, and errors.
- `/dashboard` : Trust score card (0–100 ring), breakdown (identity/activity/reputation), trend placeholder, suggestions.
- `/credentials` : List (type/status/usage/last used/expiry); detail drawer (shared platforms, revoke, share with QR placeholder, validity selector).
- `/connections` : Pending approvals (approve/deny/bulk), active connections (last access, shared credentials, revoke), history/timeline (read-only).
- `/profile` : PIN/biometric setup placeholder, session info, sign-out.

# Components & States
- Session guard for protected routes; loaders/skeletons; empty states; error with retry.
- Toasts/badges for notifications; polling/websocket placeholder hook.

# API Client Contract (frontend-facing; hand to backend)
- Auth:
  - `POST /auth/email/otp {email} -> {requestId}`
  - `POST /auth/email/verify {requestId,code} -> {accessToken,refreshToken,user}`
  - `POST /auth/phone/otp {phone} -> {requestId}`
  - `POST /auth/phone/verify {requestId,code} -> {accessToken,refreshToken,user}`
  - `POST /auth/google {idToken} -> {accessToken,refreshToken,user}`
  - `POST /auth/refresh {refreshToken} -> {accessToken,refreshToken}`
  - `POST /auth/pin {pin}` (set/verify)
  - `GET /me -> user profile + session info`
- Verification:
  - `POST /verification/sessions {flow:"identity",methods:["liveness","document","digilocker?"]} -> {sessionId,steps}`
  - `POST /verification/sessions/{id}/liveness {mediaUrl|mediaBase64} -> {status,score}`
  - `POST /verification/sessions/{id}/document {side:"front"|"back",mediaUrl|mediaBase64} -> {status,ocr,docType}`
  - `POST /verification/sessions/{id}/digilocker {authCode} -> {status}`
  - `GET /verification/sessions/{id} -> step statuses, faceMatch score`
  - `POST /verification/sessions/{id}/submit -> {status}`
- Trust Score:
  - `GET /trust-score -> {score,breakdown:{identity,activity,reputation},updatedAt,suggestions[]}`
- Credentials:
  - `GET /credentials`
  - `GET /credentials/{id}`
  - `POST /credentials/{id}/share {platformId,expiry,permissions[]} -> {qrCodeUrl?,shareId}`
  - `POST /credentials/{id}/revoke {platformId?} -> {status}`
- Connections:
  - `GET /connections`
  - `GET /connections/pending`
  - `POST /connections/{id}/approve {credentialsGranted[]}`
  - `POST /connections/{id}/deny`
  - `POST /webhooks/connections` (platform webhook receiver)
- Notifications:
  - `GET /notifications`
  - `POST /notifications/{id}/read`
- Auth header: `Authorization: Bearer <accessToken>`
- Types:
  - `User {id,email,phone?,name?,photoUrl?,trustScore}`
  - `VerificationSession {id,status,steps[],createdAt,updatedAt}`
  - `Credential {id,type,status,issuedAt,expiresAt,usageCount,lastUsedAt}`
  - `Connection {id,platform,sharedCredentials,lastAccessedAt,expiresAt}`
  - `Notification {id,type,title,body,createdAt,read}`

# UX/Acceptance notes
- Sign-in <2 min; OTP arrives <30s (UI shows loading/error states, not enforced).
- Verification flow target <5 min; show step progress, retries, and errors.
- Trust score breakdown sums to 100 with labels (Poor/Fair/Good/Excellent/Outstanding).
- QR share placeholder copy notes 5-minute expiry.
- Pending request approval flow <1 min; list views load <2s; include skeletons/empty/error states.
