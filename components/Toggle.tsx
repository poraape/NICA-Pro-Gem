import React from 'react';
import { useAnimation } from '../contexts/AnimationContext';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  label, 
  checked, 
  onChange, 
  description, 
  disabled = false 
}) => {
  const { isReducedMotion } = useAnimation();

  const handleToggle = () => {
    if (disabled) return;
    
    // Haptic Feedback
    if (navigator.vibrate) {
      navigator.vibrate(10); 
    }
    
    onChange(!checked);
  };

  return (
    <div 
      className={`flex items-center justify-between py-4 border-b border-neutral-100 last:border-0 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={handleToggle}
    >
       <div className="flex-1 pr-4">
          <p className="font-medium text-neutral-800 text-sm sm:text-base">{label}</p>
          {description && <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{description}</p>}
       </div>
       
       <button 
         type="button"
         role="switch"
         aria-checked={checked}
         disabled={disabled}
         className={`
           relative w-[52px] h-[32px] rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20
           ${checked ? 'bg-primary-500' : 'bg-neutral-200'}
           ${isReducedMotion ? 'duration-0' : 'duration-300'}
         `}
       >
         <span 
           className={`
             absolute top-1 left-1 bg-white w-[24px] h-[24px] rounded-full shadow-sm transition-transform
             ${checked ? 'translate-x-[20px]' : 'translate-x-0'}
             ${isReducedMotion ? 'duration-0' : 'duration-300'}
           `} 
         />
       </button>
    </div>
  );
};