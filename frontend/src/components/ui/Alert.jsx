import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const Alert = ({ 
  variant = 'info', 
  title, 
  description, 
  onClose, 
  className 
}) => {
  const variants = {
    // Green - Success
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 size={18} className="text-emerald-600" />,
      close: 'hover:bg-emerald-100 text-emerald-600'
    },
    // Red - Error
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle size={18} className="text-red-600" />,
      close: 'hover:bg-red-100 text-red-600'
    },
    // Blue/Teal - Info
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info size={18} className="text-blue-600" />,
      close: 'hover:bg-blue-100 text-blue-600'
    },
    // Amber - Warning
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle size={18} className="text-amber-600" />,
      close: 'hover:bg-amber-100 text-amber-600'
    }
  };

  const style = variants[variant];

  return (
    <div className={cn(
      'relative w-full rounded-lg border-2 p-4 flex gap-3 transition-all animate-in fade-in slide-in-from-top-2',
      style.container,
      className
    )}>
      <div className="shrink-0 mt-0.5">
        {style.icon}
      </div>

      <div className="flex-1">
        {title && (
          <h5 className="text-sm font-bold leading-none mb-1">
            {title}
          </h5>
        )}
        {description && (
          <div className="text-sm font-medium opacity-90 leading-relaxed">
            {description}
          </div>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'shrink-0 h-6 w-6 rounded-md flex items-center justify-center transition-colors',
            style.close
          )}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Alert;