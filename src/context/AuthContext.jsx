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
    if (!['organization_admin', 'hr', 'employee'].includes(normalized.role)) {
      throw new Error('Super Admin accounts use the Rails admin panel and cannot sign in to this frontend.');
    }
    sessionStorage.setItem('salary_management_user', JSON.stringify(normalized));
    setUser(normalized);
  }, []);

  const login = useCallback(async (credentials) => {
    await authApi.login(credentials);
    try {
      const currentUser = await authApi.currentUser();
      setAuthenticatedUser(currentUser?.user ?? currentUser);
    } catch (error) {
      await authApi.logout();
      throw error;
    }
  }, [setAuthenticatedUser]);

  const updateProfile = useCallback(async (profile) => {
    const updatedUser = await authApi.updateProfile(profile);
    setAuthenticatedUser(updatedUser?.user ?? updatedUser);
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
    if (!sessionStorage.getItem('salary_management_access_token')) {
      sessionStorage.removeItem('salary_management_token_expires_at');
      sessionStorage.removeItem('salary_management_user');
      setUser(null);
      setLoading(false);
      return () => { active = false; };
    }
    authApi.currentUser()
      .then((currentUser) => {
        if (active) setAuthenticatedUser(currentUser?.user ?? currentUser);
      })
      .catch(() => {
        if (active) {
          sessionStorage.removeItem('salary_management_access_token');
          sessionStorage.removeItem('salary_management_token_expires_at');
          sessionStorage.removeItem('salary_management_user');
          setUser(null);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [setAuthenticatedUser]);

  useEffect(() => {
    const onUnauthorized = () => {
      sessionStorage.removeItem('salary_management_access_token');
      sessionStorage.removeItem('salary_management_token_expires_at');
      sessionStorage.removeItem('salary_management_user');
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, updateProfile }), [user, loading, login, logout, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
