import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { ApiResponse } from '../services/api';
import { AuthContext } from './auth';
import type { AuthUser } from './auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get<ApiResponse<AuthUser>>('/users/me');
        setUser(response.data.data);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  async function login(email: string, password: string): Promise<void> {
    const response = await api.post<ApiResponse<{ token: string; user: AuthUser }>>('/auth/login', { email, password });
    localStorage.setItem('token', response.data.data.token);
    setToken(response.data.data.token);
    setUser(response.data.data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>;
}
