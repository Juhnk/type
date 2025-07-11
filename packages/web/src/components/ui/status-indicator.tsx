import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, AlertTriangle, Info, Circle } from 'lucide-react';

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'default';

interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: StatusType;
  showIcon?: boolean;
  iconSize?: 'sm' | 'md' | 'lg';
  label?: string;
}

const statusConfig = {
  success: {
    icon: Check,
    className: 'text-success',
    bgClassName: 'bg-success-soft',
  },
  error: {
    icon: X,
    className: 'text-error',
    bgClassName: 'bg-error-soft',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-warning',
    bgClassName: 'bg-warning-soft',
  },
  info: {
    icon: Info,
    className: 'text-primary',
    bgClassName: 'bg-primary/10',
  },
  default: {
    icon: Circle,
    className: 'text-muted-foreground',
    bgClassName: 'bg-muted',
  },
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function StatusIndicator({
  status = 'default',
  showIcon = true,
  iconSize = 'md',
  label,
  className,
  children,
  ...props
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      data-slot="status-indicator"
      className={cn(
        'inline-flex items-center gap-2',
        config.className,
        className
      )}
      {...props}
    >
      {showIcon && <Icon className={cn(iconSizes[iconSize])} />}
      {label && <span className="font-medium">{label}</span>}
      {children}
    </div>
  );
}

interface StatusBadgeProps extends StatusIndicatorProps {
  variant?: 'solid' | 'soft' | 'outline';
}

export function StatusBadge({
  status = 'default',
  variant = 'soft',
  showIcon = true,
  iconSize = 'sm',
  label,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const variantClasses = {
    solid: cn(
      'text-white',
      status === 'success' && 'bg-success',
      status === 'error' && 'bg-error',
      status === 'warning' && 'bg-warning text-warning-foreground',
      status === 'info' && 'bg-primary',
      status === 'default' && 'bg-muted-foreground'
    ),
    soft: cn(config.className, config.bgClassName),
    outline: cn(
      'border',
      config.className,
      status === 'success' && 'border-success',
      status === 'error' && 'border-error',
      status === 'warning' && 'border-warning',
      status === 'info' && 'border-primary',
      status === 'default' && 'border-border'
    ),
  };

  return (
    <div
      data-slot="status-badge"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {showIcon && <Icon className={cn(iconSizes[iconSize])} />}
      {label && <span>{label}</span>}
      {children}
    </div>
  );
}

interface StatusMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: StatusType;
  title?: string;
  message?: string;
  showIcon?: boolean;
}

export function StatusMessage({
  status = 'default',
  title,
  message,
  showIcon = true,
  className,
  children,
  ...props
}: StatusMessageProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      data-slot="status-message"
      className={cn(
        'rounded-lg border p-3',
        status === 'success' && 'border-success/20 bg-success-soft',
        status === 'error' && 'border-error/20 bg-error-soft',
        status === 'warning' && 'border-warning/20 bg-warning-soft',
        status === 'info' && 'border-primary/20 bg-primary/5',
        status === 'default' && 'border-border bg-muted',
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        {showIcon && (
          <Icon className={cn('h-4 w-4 flex-shrink-0', config.className)} />
        )}
        <div className="flex-1 space-y-1">
          {title && (
            <h5 className={cn('text-sm font-medium', config.className)}>
              {title}
            </h5>
          )}
          {message && (
            <p className="text-muted-foreground text-sm">{message}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
