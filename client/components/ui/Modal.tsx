"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className = '',
  ...props
}: ModalProps) {
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-auto',
  };
  const cs = sizeStyles[size];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`${cs} w-full rounded-2xl bg-surface-container border border-hairline shadow-2xl ${className}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            {...props}
          >
            {(title || description) && (
              <div className="border-b border-hairline px-6 py-4">
                {title && (
                  <h2 className="text-lg font-semibold text-on-surface">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {description}
                  </p>
                )}
              </div>
            )}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}