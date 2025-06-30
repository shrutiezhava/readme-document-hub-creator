
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PortalUser } from '@/types/document-portal';

interface DocumentPortalAuthContextType {
  user: PortalUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const DocumentPortalAuthContext = createContext<DocumentPortalAuthContextType | undefined>(undefined);

export const DocumentPortalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('portal_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('portal_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for username:', username);
      
      // Authenticate against the database using the stored password_hash
      const { data: users, error } = await supabase
        .from('portal_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows found

      if (error) {
        console.error('Database query error:', error);
        return false;
      }

      if (!users) {
        console.error('User not found:', username);
        return false;
      }

      // Since we're storing passwords as plain text for demo purposes, 
      // we can directly compare them
      if (users.password_hash === password) {
        console.log('Login successful for user:', users.username);
        setUser(users);
        localStorage.setItem('portal_user', JSON.stringify(users));
        return true;
      }

      console.error('Password mismatch for user:', username);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('portal_user');
  };

  return (
    <DocumentPortalAuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </DocumentPortalAuthContext.Provider>
  );
};

export const useDocumentPortalAuth = () => {
  const context = useContext(DocumentPortalAuthContext);
  if (context === undefined) {
    throw new Error('useDocumentPortalAuth must be used within a DocumentPortalAuthProvider');
  }
  return context;
};
