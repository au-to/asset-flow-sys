import { create } from 'zustand';
import { Role } from '@asset-flow/shared';
import { UserInfo } from '../api/auth';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserInfo) => void;
  clearAuth: () => void;
}

function readStoredAuth(): Pick<AuthState, 'token' | 'user' | 'isAuthenticated'> {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  if (token && userStr) {
    return { token, user: JSON.parse(userStr) as UserInfo, isAuthenticated: true };
  }
  return { token: null, user: null, isAuthenticated: false };
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readStoredAuth(),
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export function hasRole(user: UserInfo | null, roles: Role[]): boolean {
  return !!user && roles.includes(user.role);
}
