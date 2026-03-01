import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ className, label, error, options = [], ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-bold text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'appearance-none flex h-11 w-full rounded-lg border-2 border-emerald-50 bg-white px-4 py-2 text-sm text-gray-900 transition-colors',
            'focus:outline-none focus:border-emerald-400',
            'disabled:bg-gray-50 disabled:text-gray-400',
            error ? 'border-red-200' : 'hover:border-emerald-100 cursor-pointer',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option 
              key={opt.value} 
              value={opt.value} 
              className="text-gray-900 bg-white" // Ensures options are also dark text
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      
      {error && <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';
export default Select;