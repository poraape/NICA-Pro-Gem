import React from 'react';
import { ChevronDown } from 'lucide-react';

interface NutriSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  helperText?: string;
  startIcon?: React.ReactNode;
}

export const NutriSelect: React.FC<NutriSelectProps> = ({
  label,
  error,
  options,
  helperText,
  startIcon,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  const wrapperClasses = "relative group";
  
  const baseSelectClasses = `
    block w-full px-4 py-3 
    bg-white border rounded-xl appearance-none
    text-neutral-900 
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-neutral-50 disabled:text-neutral-400
    peer pt-5 pb-1
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
    scale-85 -translate-y-3.5
    ${startIcon ? 'left-10' : ''}
  `;

  return (
    <div className={wrapperClasses}>
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-3.5 text-neutral-400 pointer-events-none z-10">
            {startIcon}
          </div>
        )}
        
        <select
          id={selectId}
          className={baseSelectClasses}
          {...props}
        >
          <option value="" disabled hidden></option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        <label htmlFor={selectId} className={labelClasses}>
          {label}
        </label>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
          <ChevronDown size={18} />
        </div>
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