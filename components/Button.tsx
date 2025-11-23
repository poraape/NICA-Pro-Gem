import React from 'react';
import { useAnimation } from '../contexts/AnimationContext';

interface NutriButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const NutriButton: React.FC<NutriButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  fullWidth = false,
  className = '', 
  disabled,
  icon,
  onClick,
  ...props 
}) => {
  const { isReducedMotion } = useAnimation();

  // Base transitions and focus states
  const baseStyles = `
    inline-flex items-center justify-center font-semibold 
    focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 
    disabled:opacity-60 disabled:cursor-not-allowed 
    active:scale-[0.98] rounded-xl
    ${isReducedMotion ? 'transition-none' : 'transition-all duration-300'}
  `;
  
  // Specific heights from Design System Spec: Primary/Lg = 52px, Md = 44px
  const sizes = {
    sm: "h-[32px] px-3 text-xs",
    md: "h-[44px] px-6 text-sm", // Standard secondary/input height
    lg: "h-[52px] px-8 text-base" // Primary CTA height
  };

  const variants = {
    primary: "bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/40 border border-transparent",
    secondary: "bg-white text-primary-700 border border-primary-100 shadow-sm hover:bg-primary-50 hover:border-primary-200",
    ghost: "bg-transparent text-primary-600 hover:bg-primary-50/50",
    destructive: "bg-error-50 text-error-500 border border-error-100 hover:bg-error-100 focus-visible:ring-error-500/20"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && navigator.vibrate) {
      navigator.vibrate(5); // Light Haptic
    }
    if (onClick) onClick(e);
  };

  return (
    <button 
      className={`
        ${baseStyles} 
        ${sizes[size]} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      disabled={isLoading || disabled}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="opacity-90">Processing...</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2 -ml-1">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export const Button = NutriButton;