import { createContext, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getData, urls } from '../redux/urls';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
  logout: () => {},
  refreshUser: () => Promise.resolve(null),
});

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    const res = await dispatch(getData(urls.verify, { token }));

    if (res?.is_valid) {
      setUser(res?.user || res?.data || null);
      setLoading(false);
      return res;
    }

    logout();
    setLoading(false);
    return res;
  }, [dispatch, logout]);

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
