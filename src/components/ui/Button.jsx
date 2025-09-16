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
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:-translate-y-1';

    const variants = {
        primary: 'bg-pink text-dark hover:bg-blue hover:text-dark border-2 border-purple shadow-md hover:shadow-lg',
        secondary: 'bg-blue text-dark hover:bg-pink hover:text-dark border-2 border-dark shadow-md hover:shadow-lg',
        outline: 'border-2 border-purple text-purple hover:bg-blue hover:text-dark bg-cream shadow-md hover:shadow-lg',
        ghost: 'text-purple hover:text-dark hover:bg-pink/20 bg-transparent'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm rounded-lg min-h-[36px]',
        md: 'px-6 py-3 text-base rounded-lg min-h-[44px]',
        lg: 'px-8 py-4 text-lg rounded-xl min-h-[52px]',
        xl: 'px-10 py-5 text-xl rounded-xl min-h-[60px]'
    };

    const variantStyles = variants[variant] || variants.primary;
    const sizeStyles = sizes[size] || sizes.md;

    const fontFamily = { fontFamily: 'Poppins, sans-serif' };

    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
            style={fontFamily}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            <span className="font-medium tracking-wide hover:animate-pulse">
                {children}
            </span>
        </button>
    );
});

Button.displayName = 'Button';

export default Button;