import type {
  User,
  VerificationSession,
  TrustScore,
  Credential,
  Connection,
  Notification,
  AuthTokens,
} from '../types';
import { useSession } from '../state/session';

const API_URL = import.meta.env.VITE_API_URL || '';
const isMockMode = !API_URL;

// Mock data
const mockUser: User = {
  id: '1',
  email: 'demo@credverse.io',
  name: 'Demo User',
  phone: '+1234567890',
  trustScore: 78,
};

const mockTrustScore: TrustScore = {
  score: 78,
  breakdown: { identity: 85, activity: 70, reputation: 80 },
  updatedAt: new Date().toISOString(),
  suggestions: [
    'Complete DigiLocker verification to boost identity score',
    'Connect more platforms to improve activity score',
    'Request endorsements from verified connections',
  ],
};

const mockCredentials: Credential[] = [
  {
    id: '1',
    name: 'Email Verification',
    type: 'email',
    status: 'active',
    issuedAt: '2024-01-15T10:00:00Z',
    expiresAt: '2025-01-15T10:00:00Z',
    usageCount: 5,
    lastUsedAt: '2024-12-20T15:30:00Z',
  },
  {
    id: '2',
    name: 'Phone Verification',
    type: 'phone',
    status: 'active',
    issuedAt: '2024-02-20T14:00:00Z',
    usageCount: 3,
    lastUsedAt: '2024-12-18T09:00:00Z',
  },
  {
    id: '3',
    name: 'Government ID',
    type: 'document',
    status: 'expired',
    issuedAt: '2023-01-01T00:00:00Z',
    expiresAt: '2024-01-01T00:00:00Z',
    usageCount: 10,
  },
];

const mockConnections: Connection[] = [
  {
    id: '1',
    platform: 'TechCorp Inc.',
    sharedCredentials: ['Email Verification', 'Phone Verification'],
    lastAccessedAt: '2024-12-23T10:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    platform: 'StartupXYZ',
    sharedCredentials: ['Email Verification'],
    lastAccessedAt: '2024-12-20T14:30:00Z',
    status: 'active',
  },
];

const mockPendingConnections: Connection[] = [
  {
    id: '3',
    platform: 'FinanceApp',
    sharedCredentials: ['Government ID', 'Phone Verification'],
    lastAccessedAt: new Date().toISOString(),
    status: 'pending',
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'Verification Complete',
    body: 'Your email verification has been completed successfully.',
    createdAt: '2024-12-23T10:00:00Z',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Credential Expiring',
    body: 'Your Government ID credential will expire in 7 days.',
    createdAt: '2024-12-22T14:00:00Z',
    read: true,
  },
];

const mockVerificationSession: VerificationSession = {
  id: '1',
  status: 'in_progress',
  steps: [
    { name: 'Liveness Check', status: 'completed', score: 95 },
    { name: 'Document (Front)', status: 'completed', score: 90 },
    { name: 'Document (Back)', status: 'in_progress' },
    { name: 'Face Match', status: 'pending' },
    { name: 'DigiLocker', status: 'pending' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Helper for mock delays
const mockDelay = (ms: number = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// API helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken, signOut } = useSession.getState();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isMockMode) {
    // Try token refresh
    const refreshed = await api.auth.refresh();
    if (!refreshed) {
      signOut();
      throw new Error('Session expired');
    }
    // Retry with new token
    const newToken = useSession.getState().accessToken;
    (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
    const retryResponse = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    if (!retryResponse.ok) {
      throw new Error(`API Error: ${retryResponse.status}`);
    }
    return retryResponse.json();
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    async sendEmailOtp(email: string): Promise<{ success: boolean }> {
      if (isMockMode) {
        await mockDelay();
        return { success: true };
      }
      return apiRequest('/auth/email/otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    async verifyEmailOtp(email: string, otp: string): Promise<AuthTokens> {
      if (isMockMode) {
        await mockDelay();
        if (otp === '123456') {
          const tokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          };
          useSession.getState().setTokens(tokens.accessToken, tokens.refreshToken);
          useSession.getState().setUser(mockUser);
          return tokens;
        }
        throw new Error('Invalid OTP');
      }
      return apiRequest('/auth/email/verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
    },

    async sendPhoneOtp(phone: string): Promise<{ success: boolean }> {
      if (isMockMode) {
        await mockDelay();
        return { success: true };
      }
      return apiRequest('/auth/phone/otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
    },

    async verifyPhoneOtp(phone: string, otp: string): Promise<AuthTokens> {
      if (isMockMode) {
        await mockDelay();
        if (otp === '123456') {
          const tokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          };
          useSession.getState().setTokens(tokens.accessToken, tokens.refreshToken);
          useSession.getState().setUser(mockUser);
          return tokens;
        }
        throw new Error('Invalid OTP');
      }
      return apiRequest('/auth/phone/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      });
    },

    async googleLogin(idToken: string): Promise<AuthTokens> {
      if (isMockMode) {
        await mockDelay();
        const tokens = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        };
        useSession.getState().setTokens(tokens.accessToken, tokens.refreshToken);
        useSession.getState().setUser(mockUser);
        return tokens;
      }
      return apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
    },

    async refresh(): Promise<boolean> {
      if (isMockMode) {
        return true;
      }
      try {
        const { refreshToken } = useSession.getState();
        const tokens: AuthTokens = await apiRequest('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
        useSession.getState().setTokens(tokens.accessToken, tokens.refreshToken);
        return true;
      } catch {
        return false;
      }
    },

    async setPin(pin: string): Promise<{ success: boolean }> {
      if (isMockMode) {
        await mockDelay();
        return { success: true };
      }
      return apiRequest('/auth/pin', {
        method: 'POST',
        body: JSON.stringify({ pin }),
      });
    },

    async getMe(): Promise<User> {
      if (isMockMode) {
        await mockDelay();
        return mockUser;
      }
      return apiRequest('/me');
    },

    signOut(): void {
      useSession.getState().signOut();
    },
  },

  verification: {
    async createSession(): Promise<VerificationSession> {
      if (isMockMode) {
        await mockDelay();
        return {
          ...mockVerificationSession,
          id: Date.now().toString(),
          status: 'pending',
          steps: mockVerificationSession.steps.map((s) => ({
            ...s,
            status: 'pending',
          })),
        };
      }
      return apiRequest('/verification/sessions', { method: 'POST' });
    },

    async submitLiveness(
      sessionId: string,
      _data: unknown
    ): Promise<VerificationSession> {
      if (isMockMode) {
        await mockDelay(1500);
        return mockVerificationSession;
      }
      return apiRequest(`/verification/sessions/${sessionId}/liveness`, {
        method: 'POST',
        body: JSON.stringify(_data),
      });
    },

    async submitDocument(
      sessionId: string,
      _data: unknown
    ): Promise<VerificationSession> {
      if (isMockMode) {
        await mockDelay(1500);
        return mockVerificationSession;
      }
      return apiRequest(`/verification/sessions/${sessionId}/document`, {
        method: 'POST',
        body: JSON.stringify(_data),
      });
    },

    async connectDigiLocker(sessionId: string): Promise<VerificationSession> {
      if (isMockMode) {
        await mockDelay(1000);
        return mockVerificationSession;
      }
      return apiRequest(`/verification/sessions/${sessionId}/digilocker`, {
        method: 'POST',
      });
    },

    async getSession(sessionId: string): Promise<VerificationSession> {
      if (isMockMode) {
        await mockDelay();
        return mockVerificationSession;
      }
      return apiRequest(`/verification/sessions/${sessionId}`);
    },

    async submitSession(sessionId: string): Promise<VerificationSession> {
      if (isMockMode) {
        await mockDelay();
        return { ...mockVerificationSession, status: 'completed' };
      }
      return apiRequest(`/verification/sessions/${sessionId}/submit`, {
        method: 'POST',
      });
    },
  },

  trustScore: {
    async getTrustScore(): Promise<TrustScore> {
      if (isMockMode) {
        await mockDelay();
        return mockTrustScore;
      }
      return apiRequest('/trust-score');
    },
  },

  credentials: {
    async listCredentials(): Promise<Credential[]> {
      if (isMockMode) {
        await mockDelay();
        return mockCredentials;
      }
      return apiRequest('/credentials');
    },

    async getCredential(id: string): Promise<Credential> {
      if (isMockMode) {
        await mockDelay();
        return mockCredentials.find((c) => c.id === id) || mockCredentials[0];
      }
      return apiRequest(`/credentials/${id}`);
    },

    async shareCredential(
      id: string
    ): Promise<{ shareId: string; qrPayload: string }> {
      if (isMockMode) {
        await mockDelay();
        return {
          shareId: `share-${Date.now()}`,
          qrPayload: `credverse://share/${id}/${Date.now()}`,
        };
      }
      return apiRequest(`/credentials/${id}/share`, { method: 'POST' });
    },

    async revokeCredential(id: string): Promise<{ success: boolean }> {
      if (isMockMode) {
        await mockDelay();
        return { success: true };
      }
      return apiRequest(`/credentials/${id}/revoke`, { method: 'POST' });
    },
  },

  connections: {
    async listConnections(): Promise<Connection[]> {
      if (isMockMode) {
        await mockDelay();
        return mockConnections;
      }
      return apiRequest('/connections');
    },

    async listPending(): Promise<Connection[]> {
      if (isMockMode) {
        await mockDelay();
        return mockPendingConnections;
      }
      return apiRequest('/connections/pending');
    },

    async approveConnection(id: string): Promise<Connection> {
      if (isMockMode) {
        await mockDelay();
        const conn = mockPendingConnections.find((c) => c.id === id);
        return { ...conn!, status: 'active' };
      }
      return apiRequest(`/connections/${id}/approve`, { method: 'POST' });
    },

    async denyConnection(id: string): Promise<{ success: boolean }> {
      if (isMockMode) {
        await mockDelay();
        return { success: true };
      }
      return apiRequest(`/connections/${id}/deny`, { method: 'POST' });
    },
  },

  notifications: {
    async listNotifications(): Promise<Notification[]> {
      if (isMockMode) {
        await mockDelay();
        return mockNotifications;
      }
      return apiRequest('/notifications');
    },

    async readNotification(id: string): Promise<{ success: boolean }> {
      if (isMockMode) {
        await mockDelay();
        return { success: true };
      }
      return apiRequest(`/notifications/${id}/read`, { method: 'POST' });
    },
  },
};
