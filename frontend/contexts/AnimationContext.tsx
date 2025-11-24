import React, { createContext, useContext, useState, useEffect } from 'react';

interface AnimationContextType {
  isReducedMotion: boolean;
  toggleReducedMotion: () => void;
  // Standard durations
  duration: {
    fast: number;
    normal: number;
    slow: number;
  }
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Auto-detect system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleReducedMotion = () => setIsReducedMotion(prev => !prev);

  const duration = isReducedMotion ? {
    fast: 0,
    normal: 0,
    slow: 0
  } : {
    fast: 200,
    normal: 350,
    slow: 500
  };

  return (
    <AnimationContext.Provider value={{ isReducedMotion, toggleReducedMotion, duration }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) throw new Error('useAnimation must be used within AnimationProvider');
  return context;
};