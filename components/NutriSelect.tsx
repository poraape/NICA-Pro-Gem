import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

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
  
  const wrapperClasses = "relative group mb-1";
  
  const baseSelectClasses = `
    block w-full px-4 py-3.5 
    bg-white/80 backdrop-blur-sm border rounded-xl appearance-none
    text-neutral-900 
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white
    disabled:bg-neutral-100 disabled:text-neutral-400
    peer pt-6 pb-2 h-[58px]
    ${startIcon ? 'pl-11' : ''}
    ${error 
      ? 'border-error-500 focus:border-error-500 ring-error-500/10' 
      : 'border-neutral-200 hover:border-primary-300 focus:border-primary-500'}
    ${className}
  `;

  const labelClasses = `
    absolute left-4 top-3.5
    text-neutral-500 text-sm font-medium
    transition-all duration-300 ease-out
    pointer-events-none origin-[0]
    scale-85 -translate-y-4
    text-primary-600
    ${startIcon ? 'left-11' : ''}
  `;

  return (
    <div className={wrapperClasses}>
      <div className="relative">
        {startIcon && (
          <div className={`absolute left-4 top-4 transition-colors ${error ? 'text-error-500' : 'text-neutral-400 group-focus-within:text-primary-500'}`}>
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

        <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${error ? 'text-error-500' : 'text-neutral-400 peer-focus:text-primary-500'}`}>
          {error ? <AlertCircle size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      
      {(error || helperText) && (
        <div className={`mt-1.5 ml-1 text-xs flex items-center gap-1.5 font-medium animate-fade-in ${error ? 'text-error-500' : 'text-neutral-500'}`}>
           {error || helperText}
        </div>
      )}
    </div>
  );
};
