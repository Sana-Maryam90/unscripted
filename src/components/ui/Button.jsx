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
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-game-purple hover:bg-game-dark text-white border-3 border-game-purple hover:border-game-dark shadow-md hover:shadow-lg',
        secondary: 'bg-game-blue hover:bg-game-pink text-game-dark hover:text-white border-3 border-game-blue hover:border-game-pink shadow-md hover:shadow-lg',
        outline: 'border-3 border-game-purple text-game-purple hover:bg-game-purple hover:text-white bg-white/90 shadow-md hover:shadow-lg',
        ghost: 'text-game-purple hover:text-game-dark hover:bg-game-blue/20 bg-transparent'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm rounded-xl min-h-[40px]',
        md: 'px-6 py-3 text-base rounded-2xl min-h-[48px]',
        lg: 'px-8 py-4 text-lg rounded-2xl min-h-[56px]',
        xl: 'px-10 py-5 text-xl rounded-3xl min-h-[64px]'
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
            <span className="uppercase tracking-wide">
                {children}
            </span>
        </button>
    );
});

Button.displayName = 'Button';

export default Button;