import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL, buildAuthHeader } from '../lib/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('gt_field_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: buildAuthHeader(token) } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setUser(data);
        else { localStorage.removeItem('gt_field_token'); setToken(null); }
      })
      .catch(() => { localStorage.removeItem('gt_field_token'); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const r = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('gt_field_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('gt_field_token');
    setToken(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, token, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
};