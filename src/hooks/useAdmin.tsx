'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { ADMIN_STORAGE_KEY } from '@/lib/constants';
import logger from '@/lib/logger';

// Create the context
interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Provider component
export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check admin status on mount
  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        setIsLoading(true);
        
        // Call the server-side verification endpoint
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        
        setIsAdmin(data.isAdmin);
      } catch (error) {
        logger.error('Admin verification error:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminStatus();
  }, []);

  // Login function
  const login = async (password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Call the server-side login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsAdmin(true);
        
        // Store in localStorage as a UI indicator only
        // The actual authentication is managed by HTTP-only cookies
        try {
          localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
        } catch (error) {
          logger.error('LocalStorage error:', error);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Admin login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Call the server-side logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsAdmin(false);
        
        // Remove from localStorage
        try {
          localStorage.removeItem(ADMIN_STORAGE_KEY);
        } catch (error) {
          logger.error('LocalStorage error:', error);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Admin logout error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AdminContextType = {
    isAdmin,
    isLoading,
    login,
    logout
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

// Hook for using the admin context
export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}