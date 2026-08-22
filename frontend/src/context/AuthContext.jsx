import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

const AuthContext = createContext(null);

const rawUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('jansetu_token'));
  const [savedSchemes, setSavedSchemes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jansetu_saved_schemes') || '[]');
    } catch {
      return [];
    }
  });
  const [matchedSchemes, setMatchedSchemes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jansetu_matched_schemes') || '[]');
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [matchingSchemesLoading, setMatchingSchemesLoading] = useState(false);

  // On mount, verify token and rehydrate user + sync language, saved schemes and AI matched schemes
  useEffect(() => {
    const storedToken = localStorage.getItem('jansetu_token');
    const storedUser = localStorage.getItem('jansetu_user');
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setToken(storedToken);

        if (Array.isArray(parsed.savedSchemes)) {
          setSavedSchemes(parsed.savedSchemes);
          localStorage.setItem('jansetu_saved_schemes', JSON.stringify(parsed.savedSchemes));
        }

        if (Array.isArray(parsed.matchedSchemes) && parsed.matchedSchemes.length > 0) {
          setMatchedSchemes(parsed.matchedSchemes);
          localStorage.setItem('jansetu_matched_schemes', JSON.stringify(parsed.matchedSchemes));
        }

        const userLang = parsed.language || parsed.profile?.language;
        if (userLang && userLang !== i18n.language) {
          i18n.changeLanguage(userLang);
          localStorage.setItem('i18nextLng', userLang);
        }

        // Fetch fresh profile & matched schemes from server
        fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              const updatedUser = {
                ...parsed,
                ...data,
              };
              setUser(updatedUser);
              localStorage.setItem('jansetu_user', JSON.stringify(updatedUser));
              if (Array.isArray(data.matchedSchemes) && data.matchedSchemes.length > 0) {
                setMatchedSchemes(data.matchedSchemes);
                localStorage.setItem('jansetu_matched_schemes', JSON.stringify(data.matchedSchemes));
              }
              // Only update savedSchemes from server if server has MORE schemes than local
              // This prevents a failed /api sync from wiping locally saved schemes
              if (Array.isArray(data.savedSchemes)) {
                const localSchemes = (() => {
                  try { return JSON.parse(localStorage.getItem('jansetu_saved_schemes') || '[]'); } catch { return []; }
                })();
                if (data.savedSchemes.length >= localSchemes.length) {
                  setSavedSchemes(data.savedSchemes);
                  localStorage.setItem('jansetu_saved_schemes', JSON.stringify(data.savedSchemes));
                } else {
                  // Local has more schemes — sync them back to server in background
                  const storedTok = localStorage.getItem('jansetu_token');
                  if (storedTok) {
                    localSchemes.forEach(scheme => {
                      if (!data.savedSchemes.some(s => s.id === scheme.id)) {
                        fetch(`${API_BASE}/auth/saved-schemes`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${storedTok}` },
                          body: JSON.stringify({ scheme }),
                        }).catch(() => {});
                      }
                    });
                  }
                }
              }
            }
          })
          .catch(() => {});
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
    const data = await res.json().catch(() => ({}));
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
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Login failed. Please check your credentials.');
    _persist(data.token, data.user);

    if (Array.isArray(data.user.savedSchemes)) {
      setSavedSchemes(data.user.savedSchemes);
      localStorage.setItem('jansetu_saved_schemes', JSON.stringify(data.user.savedSchemes));
    }

    if (Array.isArray(data.user.matchedSchemes)) {
      setMatchedSchemes(data.user.matchedSchemes);
      localStorage.setItem('jansetu_matched_schemes', JSON.stringify(data.user.matchedSchemes));
    }

    const userLang = data.user.language || data.user.profile?.language;
    if (userLang) {
      i18n.changeLanguage(userLang);
      localStorage.setItem('i18nextLng', userLang);
    }
    return data.user;
  };

  const saveProfile = async (profileData) => {
    setMatchingSchemesLoading(true);
    try {
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
        matchedSchemes: data.matchedSchemes || [],
      };
      setUser(updated);
      localStorage.setItem('jansetu_user', JSON.stringify(updated));

      if (Array.isArray(data.matchedSchemes)) {
        setMatchedSchemes(data.matchedSchemes);
        localStorage.setItem('jansetu_matched_schemes', JSON.stringify(data.matchedSchemes));
      }

      if (profileData.language) {
        i18n.changeLanguage(profileData.language);
        localStorage.setItem('i18nextLng', profileData.language);
      }
      return data;
    } finally {
      setMatchingSchemesLoading(false);
    }
  };

  // Fetch or force regenerate matched schemes with Gemini
  const fetchMatchedSchemes = async (overrideProfile = null) => {
    setMatchingSchemesLoading(true);
    try {
      const storedToken = localStorage.getItem('jansetu_token') || token;
      if (overrideProfile) {
        const res = await fetch(`${API_BASE}/schemes/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: overrideProfile, language: i18n.language || 'en' }),
        });
        const data = await res.json();
        if (data && Array.isArray(data.schemes)) {
          setMatchedSchemes(data.schemes);
          localStorage.setItem('jansetu_matched_schemes', JSON.stringify(data.schemes));
          return data.schemes;
        }
      } else if (storedToken) {
        const res = await fetch(`${API_BASE}/auth/matched-schemes`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const data = await res.json();
        if (data && Array.isArray(data.matchedSchemes)) {
          setMatchedSchemes(data.matchedSchemes);
          localStorage.setItem('jansetu_matched_schemes', JSON.stringify(data.matchedSchemes));
          return data.matchedSchemes;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch matched schemes:', err);
    } finally {
      setMatchingSchemesLoading(false);
    }
    return matchedSchemes;
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

  // Save / Bookmark a scheme to DB and state
  const saveScheme = async (scheme) => {
    if (!scheme || !scheme.id) return;
    const item = {
      id: scheme.id,
      name: scheme.name || scheme.shortName || 'Government Scheme',
      shortName: scheme.shortName,
      ministry: scheme.ministry,
      category: scheme.category || 'social',
      description: scheme.description,
      benefit: scheme.benefit,
      eligibility: scheme.eligibility || [],
      requiredDocs: scheme.requiredDocs || [],
      applyUrl: scheme.applyUrl || scheme.apply_url || `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.name || '')}`,
      savedAt: new Date().toISOString(),
    };

    const currentLocal = (() => {
      try { return JSON.parse(localStorage.getItem('jansetu_saved_schemes') || '[]'); } catch { return []; }
    })();

    const exists = currentLocal.some(s => s.id === scheme.id);
    if (!exists) {
      const updated = [item, ...currentLocal];
      // Immediately update both state and localStorage — this is the source of truth
      setSavedSchemes(updated);
      localStorage.setItem('jansetu_saved_schemes', JSON.stringify(updated));

      const storedToken = localStorage.getItem('jansetu_token') || token;
      if (storedToken) {
        // Sync to DB in background — failure is OK, localStorage is the fallback
        fetch(`${API_BASE}/auth/saved-schemes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify({ scheme: item }),
        }).catch(err => console.warn('Failed to sync saved scheme to DB (will retry on next login):', err));
      }
    }
  };

  // Remove a saved scheme from DB and state
  const removeSavedScheme = async (schemeId) => {
    const updated = savedSchemes.filter(s => s.id !== schemeId);
    setSavedSchemes(updated);
    localStorage.setItem('jansetu_saved_schemes', JSON.stringify(updated));

    const storedToken = localStorage.getItem('jansetu_token') || token;
    if (storedToken) {
      try {
        await fetch(`${API_BASE}/auth/saved-schemes/${schemeId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
      } catch (err) {
        console.warn('Failed to sync scheme deletion to DB:', err);
      }
    }
  };

  const isSchemeSaved = (schemeId) => {
    return savedSchemes.some(s => s.id === schemeId);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setMatchedSchemes([]);
    setSavedSchemes([]);
    localStorage.removeItem('jansetu_token');
    localStorage.removeItem('jansetu_user');
    localStorage.removeItem('jansetu_matched_schemes');
    localStorage.removeItem('jansetu_saved_schemes');
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
      savedSchemes,
      matchedSchemes,
      matchingSchemesLoading,
      fetchMatchedSchemes,
      saveScheme,
      removeSavedScheme,
      isSchemeSaved,
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
