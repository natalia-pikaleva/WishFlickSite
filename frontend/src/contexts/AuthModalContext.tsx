import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthModalContextType {
  isAuthOpen: boolean;
  authMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  toggleAuthMode: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
	  console.log('openAuthModal called with mode:', mode);
	  setAuthMode(mode);
	  setIsAuthOpen(true);
	};


  const closeAuthModal = () => setIsAuthOpen(false);

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
  };

  return (
    <AuthModalContext.Provider value={{ isAuthOpen, authMode, openAuthModal, closeAuthModal, toggleAuthMode }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
