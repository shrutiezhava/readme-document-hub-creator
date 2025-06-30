
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERS = {
  'Shruti': { password: 'BOOKWORM', name: 'Shruti' },
  'Sangeeta': { password: 'admin@rv', name: 'Sangeeta' }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('rv_admin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const adminUser = ADMIN_USERS[username as keyof typeof ADMIN_USERS];
    
    if (adminUser && adminUser.password === password) {
      const user = { username, name: adminUser.name };
      setUser(user);
      localStorage.setItem('rv_admin_user', JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rv_admin_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
