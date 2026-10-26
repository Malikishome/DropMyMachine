import React, { useState } from 'react';
import { AuthContext } from './authContext.js';

function readStoredSession() {
  const raw = localStorage.getItem('session');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const login = (newSession) => {
    localStorage.setItem('session', JSON.stringify(newSession));
    setSession(newSession);
  };

  const logout = () => {
    localStorage.removeItem('session');
    setSession(null);
  };

  const value = {
    session,
    user: session?.user ?? null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
