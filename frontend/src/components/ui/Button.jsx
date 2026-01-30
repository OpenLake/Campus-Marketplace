import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = {
  variant: {
    // Changed bg-primary-600 to bg-indigo-600
    default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-95 transition-all',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-indigo-600 bg-transparent text-indigo-600 hover:bg-indigo-50',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    ghost: 'hover:bg-gray-100 text-gray-700',
    link: 'text-indigo-600 underline-offset-4 hover:underline',
  },
  size: {
    default: 'h-10 px-4 py-2 font-semibold',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8 text-base',
    icon: 'h-10 w-10',
  },
};
const Button = forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      isLoading = false,
      disabled = false,
      children,
      leftIcon,
      rightIcon,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? 'div' : 'button';

    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export default Button;