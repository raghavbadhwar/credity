export interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  photoUrl?: string;
  trustScore?: number;
}

export interface VerificationStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  score?: number;
}

export interface VerificationSession {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  steps: VerificationStep[];
  createdAt: string;
  updatedAt: string;
}

export interface TrustScoreBreakdown {
  identity: number;
  activity: number;
  reputation: number;
}

export interface TrustScore {
  score: number;
  breakdown: TrustScoreBreakdown;
  updatedAt: string;
  suggestions: string[];
}

export interface Credential {
  id: string;
  type: string;
  name: string;
  status: 'active' | 'expired' | 'revoked';
  issuedAt: string;
  expiresAt?: string;
  usageCount: number;
  lastUsedAt?: string;
}

export interface Connection {
  id: string;
  platform: string;
  sharedCredentials: string[];
  lastAccessedAt: string;
  expiresAt?: string;
  status: 'pending' | 'active' | 'revoked';
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  code?: string;
}
