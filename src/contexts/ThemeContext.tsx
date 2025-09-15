import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    if (user) {
      setTheme(user.theme);
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [user, theme]);

  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    if (user) {
      await updateProfile({ theme: newTheme });
    }
    
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const value = {
    theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}