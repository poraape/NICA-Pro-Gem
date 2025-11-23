import React from 'react';
import { HelpCircle } from 'lucide-react';

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
  ...props
}) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  const wrapperClasses = "relative group";
  
  const baseInputClasses = `
    block w-full px-4 py-3 
    bg-white border rounded-xl 
    text-neutral-900 placeholder-transparent 
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-neutral-50 disabled:text-neutral-400
    ${startIcon ? 'pl-10' : ''}
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
      : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100'}
    ${className}
  `;

  const labelClasses = `
    absolute left-4 top-3 
    text-neutral-500 text-sm 
    transition-all duration-200 
    pointer-events-none origin-[0]
    peer-placeholder-shown:scale-100 
    peer-placeholder-shown:translate-y-0.5 
    peer-placeholder-shown:text-neutral-500
    peer-focus:scale-85 
    peer-focus:-translate-y-3.5
    peer-focus:text-primary-600
    ${startIcon ? 'peer-placeholder-shown:left-10' : ''}
    ${multiline ? 'peer-placeholder-shown:translate-y-0' : ''}
    -translate-y-3.5 scale-85
  `;

  return (
    <div className={wrapperClasses}>
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-3.5 text-neutral-400">
            {startIcon}
          </div>
        )}
        
        {multiline ? (
          <textarea
            id={inputId}
            className={`${baseInputClasses} min-h-[120px] resize-y peer pt-6`}
            placeholder={label}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            className={`${baseInputClasses} h-12 peer pt-5 pb-1`}
            placeholder={label}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
        
        {tooltip && (
          <div className="absolute right-3 top-3.5 group/tooltip cursor-help z-10">
            <HelpCircle size={18} className="text-neutral-300 hover:text-primary-500 transition-colors" />
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-neutral-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none">
              {tooltip}
              <div className="absolute bottom-0 right-2 translate-y-1/2 rotate-45 w-2 h-2 bg-neutral-800"></div>
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className={`mt-1.5 text-xs flex items-center gap-1 ${error ? 'text-red-500 font-medium' : 'text-neutral-500'}`}>
           {error && (
             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           )}
           {error || helperText}
        </div>
      )}
    </div>
  );
};