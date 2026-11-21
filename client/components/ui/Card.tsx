"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  interactive?: boolean;
}

export default function Card({ className = '', hover = false, interactive = false, ...props }: CardProps) {
  const baseStyles = 'rounded-xl border border-emerald-500/20 bg-[#111827] shadow-lg';

  const interactiveStyles = interactive
    ? 'transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:border-emerald-400/30 cursor-pointer'
    : '';

  const hoverStyles = hover
    ? 'hover:bg-[#0a1410]'
    : '';

  const c = `${baseStyles} ${interactiveStyles} ${hoverStyles} ${className}`;

  return (
    <motion.div
      className={c}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      {...(props as any)}
    />
  );
}