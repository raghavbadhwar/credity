import { create } from 'zustand';
import type { User } from '../types';

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

export const useSession = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  loading: false,
  error: null,
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  signOut: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      loading: false,
      error: null,
    }),
}));
