import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

function normalizeRole(role) {
  const value = String(role || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (['organization_admin', 'organisation_admin', 'org_admin', 'admin'].includes(value)) return 'organization_admin';
  if (['hr', 'human_resources'].includes(value)) return 'hr';
  if (value === 'employee') return 'employee';
  return value;
}

function normalizeUser(user) {
  if (!user || typeof user !== 'object') return null;
  return {
    ...user,
    role: normalizeRole(user.role ?? user.user_type ?? user.account_type),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return normalizeUser(JSON.parse(sessionStorage.getItem('salary_management_user')));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const setAuthenticatedUser = useCallback((value) => {
    const normalized = normalizeUser(value);
    if (!normalized?.role) throw new Error('The login response did not include a user role.');
    sessionStorage.setItem('salary_management_user', JSON.stringify(normalized));
    setUser(normalized);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    setAuthenticatedUser(response.user);
  }, [setAuthenticatedUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const savedToken = sessionStorage.getItem('salary_management_token');
    if (!savedToken && !user) {
      setLoading(false);
      return () => { active = false; };
    }
    authApi.currentUser()
      .then((currentUser) => { if (active) setAuthenticatedUser(currentUser?.user ?? currentUser); })
      .catch(() => {
        if (active) {
          sessionStorage.removeItem('salary_management_token');
          sessionStorage.removeItem('salary_management_user');
          setUser(null);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [setAuthenticatedUser]);

  useEffect(() => {
    const onUnauthorized = () => {
      sessionStorage.removeItem('salary_management_user');
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
