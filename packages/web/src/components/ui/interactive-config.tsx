import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface InteractiveConfigProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | React.ReactNode;
  onToggle?: () => void;
  isActive?: boolean;
  showArrow?: boolean;
  disabled?: boolean;
}

export function InteractiveConfig({
  label,
  value,
  onToggle,
  isActive = false,
  showArrow = false,
  disabled = false,
  className,
  ...props
}: InteractiveConfigProps) {
  return (
    <div
      data-slot="interactive-config"
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      <span className="text-muted-foreground text-sm font-medium">
        {label}:
      </span>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'transition-base focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium',
          'bg-background border shadow-sm',
          'hover:bg-accent hover:text-accent-foreground',
          'disabled:pointer-events-none disabled:opacity-50',
          isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
      >
        {value}
        {showArrow && <ChevronRight className="h-3 w-3" />}
      </button>
    </div>
  );
}

interface ConfigGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ConfigGroup({
  children,
  className,
  ...props
}: ConfigGroupProps) {
  return (
    <div
      data-slot="config-group"
      className={cn(
        'bg-card flex flex-wrap items-center gap-3 rounded-lg border p-4 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ToggleConfigProps extends React.HTMLAttributes<HTMLButtonElement> {
  label: string;
  isActive?: boolean;
  onToggle?: () => void;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default';
}

export function ToggleConfig({
  label,
  isActive = false,
  onToggle,
  variant = 'outline',
  size = 'sm',
  className,
  ...props
}: ToggleConfigProps) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-9 px-4',
  };

  const variantClasses = {
    default: cn(
      'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
      !isActive &&
        'bg-secondary text-secondary-foreground hover:bg-secondary/80'
    ),
    outline: cn(
      'border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
      isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
    ),
  };

  return (
    <button
      onClick={onToggle}
      data-slot="toggle-config"
      className={cn(
        'transition-base focus-ring disabled-state inline-flex items-center justify-center rounded-md font-medium',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {label}
    </button>
  );
}
