import React from 'react';
import { HelpCircle, AlertCircle } from 'lucide-react';

interface NutriInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  multiline?: boolean;
  helperText?: string;
  tooltip?: string;
  startIcon?: React.ReactNode;
}

export const NutriInput: React.FC<NutriInputProps> = ({
  label,
  error,
  multiline = false,
  helperText,
  tooltip,
  startIcon,
  className = '',
  id,
  onBlur,
  ...props
}) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  const wrapperClasses = "relative group mb-4";
  
  // Updated to match Design Tokens: 
  // Height 44pt (standard) or 52pt (if styled as large), 
  // Focus Glow: 0 0 0 4px rgba(32, 129, 146, 0.15)
  
  const baseInputClasses = `
    block w-full px-4 
    bg-white/80 backdrop-blur-sm border rounded-xl 
    text-neutral-900 placeholder-transparent 
    transition-all duration-300 ease-out
    focus:outline-none focus:bg-white
    disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed
    ${startIcon ? 'pl-11' : ''}
    ${error 
      ? 'border-error-500 focus:border-error-500 focus:shadow-[0_0_0_4px_rgba(192,21,48,0.15)]' 
      : 'border-neutral-200 hover:border-primary-300 focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(32,129,146,0.15)]'}
    ${className}
  `;

  const labelClasses = `
    absolute left-4 top-3.5 
    text-neutral-500 text-sm font-medium
    transition-all duration-300 ease-out
    pointer-events-none origin-[0]
    peer-placeholder-shown:scale-100 
    peer-placeholder-shown:translate-y-0.5 
    peer-placeholder-shown:text-neutral-400
    peer-focus:scale-85 
    peer-focus:-translate-y-3.5
    peer-focus:text-primary-600
    ${startIcon ? 'peer-placeholder-shown:left-11' : ''}
    ${multiline ? 'peer-placeholder-shown:translate-y-0' : ''}
    -translate-y-3.5 scale-85
  `;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onBlur) onBlur(e);
  };

  return (
    <div className={wrapperClasses}>
      <div className="relative">
        {startIcon && (
          <div className={`absolute left-4 top-3.5 transition-colors ${error ? 'text-error-500' : 'text-neutral-400 group-focus-within:text-primary-500'}`}>
            {startIcon}
          </div>
        )}
        
        {multiline ? (
          <textarea
            id={inputId}
            className={`${baseInputClasses} min-h-[120px] resize-y peer pt-6 pb-2 py-3.5`}
            placeholder={label}
            onBlur={handleBlur}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            className={`${baseInputClasses} h-[48px] peer pt-5 pb-1`} // 48px to accommodate label float comfortably
            placeholder={label}
            onBlur={handleBlur}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
        
        {tooltip && !error && (
          <div className="absolute right-3 top-3.5 group/tooltip cursor-help z-10">
            <HelpCircle size={18} className="text-neutral-300 hover:text-primary-500 transition-colors" />
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-neutral-800/95 backdrop-blur text-white text-xs leading-relaxed rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none transform origin-bottom-right scale-95 group-hover/tooltip:scale-100 z-50">
              {tooltip}
              <div className="absolute bottom-0 right-2 translate-y-1/2 rotate-45 w-2 h-2 bg-neutral-800"></div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute right-3 top-3.5 text-error-500 animate-[shake_0.4s_ease-in-out]">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className={`mt-1.5 ml-1 text-xs flex items-center gap-1.5 font-medium animate-fade-in ${error ? 'text-error-500' : 'text-neutral-500'}`}>
           {error || helperText}
        </div>
      )}
    </div>
  );
};