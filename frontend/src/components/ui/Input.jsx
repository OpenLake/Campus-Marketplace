import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(
  (
    { className, type = 'text', label, error, helperText, leftIcon, rightIcon, ...props },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900',
              'placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
              'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100/30',
              'transition-all duration-200',
              // FIXED: Added focus:border-red-500 so red doesn't turn blue on click if there's an error
              error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              {rightIcon}
            </div>
          )}
          
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;