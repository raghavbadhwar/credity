# Gateway MVP Frontend Specification

## Overview
The CredVerse Gateway is the secure identity gateway frontend for the Credity ecosystem. This document outlines the information architecture, routes, components, states, and API contracts for the MVP.

## Information Architecture (IA)

```
/
├── /login          - Authentication (public)
├── /verify         - Identity verification (protected)
├── /dashboard      - Trust score overview (protected)
├── /credentials    - Credential management (protected)
├── /connections    - Platform connections (protected)
├── /profile        - User settings (protected)
├── /legacy         - Original demo (public)
└── /404            - Not found
```

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Redirects to `/login` if unauthenticated, else `/dashboard` |
| `/login` | Public | Authentication page with multiple methods |
| `/verify` | Protected | Identity verification workflow |
| `/dashboard` | Protected | Trust score overview and quick actions |
| `/credentials` | Protected | Credential list, share, and revoke |
| `/connections` | Protected | Platform connections management |
| `/profile` | Protected | Account settings and sign out |
| `/legacy` | Public | Original demo preserved |
| `/404` | Public | Not found page |

## Components

### Layout Components
- **Shell** (`src/components/Layout/Shell.tsx`)
  - Top navigation with brand + "Secure Identity Gateway"
  - Notification bell badge placeholder
  - User avatar placeholder
  - Footer with copyright

- **AuthGuard** (`src/components/Layout/AuthGuard.tsx`)
  - Protects routes requiring authentication
  - Redirects to `/login` with `state.from` for return navigation

### UI Components (`src/components/ui/`)
- **Button** - Primary, secondary, outline, ghost, destructive variants
- **Input** - Form input with label and error states
- **Card** - Container with header, content, footer sections
- **Pill/Badge** - Status indicators (default, success, warning, error, info)
- **Skeleton** - Loading placeholder
- **EmptyState** - Empty content placeholder
- **ErrorState** - Error display with retry action
- **Stepper** - Multi-step progress indicator
- **TrustRing** - SVG ring for trust score visualization
- **QRPlaceholder** - QR code placeholder with 5-minute validity note
- **NotificationBell** - Bell icon with unread count badge

## States

### Session State (`src/state/session.ts`)
Using Zustand for state management:

```typescript
interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => void;
}
```

## API Contract

### Configuration
- **VITE_API_URL**: API base URL (empty for mock mode)
- Mock mode enables when `VITE_API_URL` is empty

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/email/otp` | Send email OTP |
| POST | `/auth/email/verify` | Verify email OTP |
| POST | `/auth/phone/otp` | Send phone OTP |
| POST | `/auth/phone/verify` | Verify phone OTP |
| POST | `/auth/google` | Google OAuth login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/pin` | Set/verify PIN |
| GET | `/me` | Get current user |

### Verification Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/verification/sessions` | Create verification session |
| POST | `/verification/sessions/{id}/liveness` | Submit liveness check |
| POST | `/verification/sessions/{id}/document` | Submit document |
| POST | `/verification/sessions/{id}/digilocker` | Connect DigiLocker |
| GET | `/verification/sessions/{id}` | Get session status |
| POST | `/verification/sessions/{id}/submit` | Submit for review |

### Trust Score Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trust-score` | Get trust score with breakdown |

### Credentials Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/credentials` | List credentials |
| GET | `/credentials/{id}` | Get credential details |
| POST | `/credentials/{id}/share` | Generate share token (5-min TTL) |
| POST | `/credentials/{id}/revoke` | Revoke credential |

### Connections Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/connections` | List active connections |
| GET | `/connections/pending` | List pending requests |
| POST | `/connections/{id}/approve` | Approve connection |
| POST | `/connections/{id}/deny` | Deny connection |

### Notifications Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| POST | `/notifications/{id}/read` | Mark as read |

## UX Acceptance Notes

### Performance Targets
- **Sign-in**: Complete in under 2 minutes
- **Verification**: Complete in under 5 minutes
- **List load**: Under 2 seconds
- **QR validity**: 5 minutes (displayed to user)

### Authentication
- Multiple auth methods: Google, Email OTP, Phone OTP, PIN
- Mock mode uses OTP code `123456`
- Token refresh on 401 (when not in mock mode)
- Clear session state on sign out

### Verification Flow
1. Liveness Check
2. Document (Front)
3. Document (Back)
4. Face Match
5. DigiLocker (optional)
6. Review & Submit

### Credential Sharing
- QR code displays "Valid for 5 minutes" notice
- Share tokens expire after 5 minutes
- Revocation immediately invalidates access

### Error Handling
- All pages include error states with retry actions
- Loading skeletons for async operations
- Empty states for no data scenarios

## Type Definitions

See `src/types.ts` for complete type definitions:
- User
- VerificationSession
- VerificationStep
- TrustScore
- TrustScoreBreakdown
- Credential
- Connection
- Notification
- AuthTokens
- ApiError
