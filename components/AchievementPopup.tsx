import React, { useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';

interface AchievementPopupProps {
  title: string;
  subtitle: string;
  isVisible: boolean;
  onClose: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ title, subtitle, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      triggerConfetti();
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] animate-scale-in">
       <div className="bg-white/95 backdrop-blur-xl border-2 border-brand-yellow rounded-[24px] shadow-2xl p-1 pr-6 flex items-center gap-4 relative overflow-hidden max-w-sm w-full">
          {/* Shine Effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>

          <div className="w-14 h-14 bg-gradient-to-br from-brand-yellow to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 z-10">
             <Trophy size={28} fill="currentColor" />
          </div>
          
          <div className="z-10">
             <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-0.5">Achievement Unlocked</p>
             <h4 className="font-bold text-neutral-900 leading-tight">{title}</h4>
             <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
          </div>

          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 text-neutral-300 hover:text-neutral-500 z-20"
          >
            <X size={14} />
          </button>
       </div>
    </div>
  );
};