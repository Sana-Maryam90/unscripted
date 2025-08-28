'use client';

import { forwardRef } from 'react';

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    ...props
}, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-purple-500',
        secondary: 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white shadow-lg hover:shadow-xl focus:ring-white/50',
        outline: 'border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white focus:ring-purple-500',
        ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm rounded-lg',
        md: 'px-6 py-3 text-base rounded-xl',
        lg: 'px-8 py-4 text-lg rounded-xl',
        xl: 'px-10 py-5 text-xl rounded-2xl'
    };

    const variantStyles = variants[variant] || variants.primary;
    const sizeStyles = sizes[size] || sizes.md;

    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;