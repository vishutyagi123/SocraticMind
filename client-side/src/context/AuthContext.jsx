import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse JWT access token from memory (we'll fetch it from the API on boot)
  // The actual tokens are httpOnly cookies, but we have a /api/auth/me endpoint!

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 1. Can we get /me?
      let res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { credentials: 'include' });
      
      // 2. If 401, try to refresh
      if (res.status === 401) {
        const refreshRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include'
        });
        
        if (refreshRes.ok) {
          // Retry /me
          res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { credentials: 'include' });
        }
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await res.json();
    setUser(data.user);
  };

  const signup = async (name, email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include'
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Signup failed');
    }
    
    const data = await res.json();
    setUser(data.user);
  };

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
