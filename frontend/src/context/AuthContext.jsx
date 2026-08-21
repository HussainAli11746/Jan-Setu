import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('jansetu_token'));
  const [loading, setLoading] = useState(true);

  // On mount, verify token and rehydrate user + sync language
  useEffect(() => {
    const storedToken = localStorage.getItem('jansetu_token');
    const storedUser = localStorage.getItem('jansetu_user');
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setToken(storedToken);

        const userLang = parsed.language || parsed.profile?.language;
        if (userLang && userLang !== i18n.language) {
          i18n.changeLanguage(userLang);
          localStorage.setItem('i18nextLng', userLang);
        }
      } catch {
        localStorage.removeItem('jansetu_token');
        localStorage.removeItem('jansetu_user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password, language = i18n.language || 'en') => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    _persist(data.token, data.user);
    if (language) {
      i18n.changeLanguage(language);
      localStorage.setItem('i18nextLng', language);
    }
    return data.user;
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    _persist(data.token, data.user);

    const userLang = data.user.language || data.user.profile?.language;
    if (userLang) {
      i18n.changeLanguage(userLang);
      localStorage.setItem('i18nextLng', userLang);
    }
    return data.user;
  };

  const saveProfile = async (profileData) => {
    const storedToken = localStorage.getItem('jansetu_token') || token;
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedToken}`,
      },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Profile update failed');

    const updated = {
      ...user,
      language: data.language || profileData.language || user?.language,
      profile: data.profile,
    };
    setUser(updated);
    localStorage.setItem('jansetu_user', JSON.stringify(updated));

    if (profileData.language) {
      i18n.changeLanguage(profileData.language);
      localStorage.setItem('i18nextLng', profileData.language);
    }
    return data;
  };

  // Change language in i18n, localStorage, and DB
  const updateLanguage = async (newLang) => {
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);

    if (user) {
      const updated = {
        ...user,
        language: newLang,
        profile: { ...user.profile, language: newLang },
      };
      setUser(updated);
      localStorage.setItem('jansetu_user', JSON.stringify(updated));

      const storedToken = localStorage.getItem('jansetu_token') || token;
      if (storedToken) {
        try {
          await fetch(`${API_BASE}/auth/language`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${storedToken}`,
            },
            body: JSON.stringify({ language: newLang }),
          });
        } catch (err) {
          console.warn('Failed to sync language to DB:', err);
        }
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jansetu_token');
    localStorage.removeItem('jansetu_user');
  };

  const _persist = (tok, usr) => {
    setToken(tok);
    setUser(usr);
    localStorage.setItem('jansetu_token', tok);
    localStorage.setItem('jansetu_user', JSON.stringify(usr));
  };

  const isAuthenticated = !!user && !!token;
  const isOnboarded = isAuthenticated && user?.profile?.onboardingComplete;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      isOnboarded,
      register,
      login,
      logout,
      saveProfile,
      updateLanguage,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
