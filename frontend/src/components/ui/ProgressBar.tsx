import React from 'react';
import { cn } from './Card';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  indicatorColor?: string;
}

export function ProgressBar({ className, value, max = 100, indicatorColor = 'bg-primary-600', ...props }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-200', className)}
      {...props}
    >
      <div
        className={cn('h-full transition-all duration-500 ease-in-out', indicatorColor)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
