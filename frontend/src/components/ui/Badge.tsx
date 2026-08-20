import React from 'react';
import { cn } from './Card';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';
  
  const variants = {
    default: 'border-transparent bg-surface-100 text-slate-900',
    success: 'border-transparent bg-success-50 text-success-600',
    warning: 'border-transparent bg-warning-50 text-warning-600',
    danger: 'border-transparent bg-danger-50 text-danger-600',
    info: 'border-transparent bg-primary-50 text-primary-700',
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}
