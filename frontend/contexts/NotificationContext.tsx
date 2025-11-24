import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/Toast';
import { AchievementPopup } from '../components/AchievementPopup';

interface NotificationContextType {
  showToast: (message: string, type: ToastType) => void;
  unlockAchievement: (title: string, subtitle: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const [achievement, setAchievement] = useState<{ title: string; subtitle: string } | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    setToast({ msg, type });
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(type === 'error' ? [50, 50] : 10);
  }, []);

  const unlockAchievement = useCallback((title: string, subtitle: string) => {
    setAchievement({ title, subtitle });
    if (navigator.vibrate) navigator.vibrate([10, 50, 10, 50, 50]); // Celebration pattern
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, unlockAchievement }}>
      {children}
      
      {/* Global Overlays */}
      <Toast 
        message={toast?.msg || ''} 
        type={toast?.type || 'info'} 
        isVisible={!!toast} 
        onClose={() => setToast(null)} 
      />
      
      <AchievementPopup 
        title={achievement?.title || ''} 
        subtitle={achievement?.subtitle || ''}
        isVisible={!!achievement}
        onClose={() => setAchievement(null)}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};