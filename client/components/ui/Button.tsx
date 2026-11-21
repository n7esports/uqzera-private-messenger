"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2';
  
  const variantStyles: Record<string, string> = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    secondary: 'bg-surface-container hover:bg-surface-high text-on-surface border border-hairline',
    danger: 'bg-error hover:bg-error/90 text-white shadow-sm',
    ghost: 'text-on-surface hover:bg-surface-high',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  // Use variables to avoid unused var warnings
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const d = disabled ? disabledStyles : '';

  return (
    <motion.button
      className={`${baseStyles} ${v} ${s} ${d} ${className}`}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.98 }}
      {...(props as any)}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.953 7.953 0 014 12H0c0 3.042 1.21 5.885 3.343 8.036l2.624-2.624c-.27-.268-.52-.55-.74-.85z"
          />
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
}