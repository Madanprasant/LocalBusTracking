import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Simulate auth check without backend
    const initAuth = async () => {
      if (token) {
        try {
          // Mock user data for demo
          const mockUser = {
            id: '1',
            username: 'demo_user',
            role: 'user',
            favorites: []
          };
          setUser(mockUser);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (username, password) => {
    try {
      // Mock login for demo
      const mockToken = 'demo_token_' + Date.now();
      const mockUser = {
        id: '1',
        username: username,
        role: username === 'admin' ? 'admin' : 'user',
        favorites: []
      };
      
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      setUser(mockUser);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: 'Login failed' 
      };
    }
  };

  const signup = async (username, password, role = 'user') => {
    try {
      // Mock signup for demo
      const mockToken = 'demo_token_' + Date.now();
      const mockUser = {
        id: '1',
        username: username,
        role: role,
        favorites: []
      };
      
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      setUser(mockUser);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: 'Signup failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isAuthenticated = () => !!user;

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
