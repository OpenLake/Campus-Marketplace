import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
const Input = forwardRef(({ className, label, error, helperText, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-bold text-gray-700">
          {label}
          {props.required && <span className="text-emerald-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        className={cn(
          // Added 'text-gray-900' here to ensure visibility
          'flex h-11 w-full rounded-lg border-2 border-emerald-50 bg-white px-4 py-2 text-sm text-gray-900 transition-colors',
          'placeholder:text-gray-400',
          'focus:outline-none focus:border-emerald-400 focus:ring-0',
          'disabled:bg-gray-50 disabled:text-gray-400',
          error ? 'border-red-200 focus:border-red-500' : 'hover:border-emerald-100',
          className
        )}
        {...props}
      />
      
      {error ? (
        <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-gray-400 font-medium">{helperText}</p>
      ) : null}
    </div>
  );
});
Input.displayName = 'Input';
export default Input;