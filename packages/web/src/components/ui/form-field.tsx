import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  error?: string;
}

function FormField({ children, error, className, ...props }: FormFieldProps) {
  return (
    <div
      data-slot="form-field"
      className={cn('form-field', className)}
      {...props}
    >
      {children}
      {error && <FormFieldError>{error}</FormFieldError>}
    </div>
  );
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

function FormLabel({
  children,
  required,
  className,
  ...props
}: FormLabelProps) {
  return (
    <label
      data-slot="form-label"
      className={cn(
        'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}

interface FormDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

function FormDescription({ className, ...props }: FormDescriptionProps) {
  return (
    <p
      data-slot="form-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

interface FormFieldErrorProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

function FormFieldError({ className, ...props }: FormFieldErrorProps) {
  return (
    <p
      data-slot="form-error"
      className={cn('text-destructive text-sm font-medium', className)}
      {...props}
    />
  );
}

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

function FormGroup({ className, ...props }: FormGroupProps) {
  return (
    <div
      data-slot="form-group"
      className={cn('form-group', className)}
      {...props}
    />
  );
}

interface FormSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
}

function FormSection({
  title,
  description,
  children,
  className,
  ...props
}: FormSectionProps) {
  return (
    <section
      data-slot="form-section"
      className={cn('space-y-6', className)}
      {...props}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-heading-sm">{title}</h3>}
          {description && <FormDescription>{description}</FormDescription>}
        </div>
      )}
      {children}
    </section>
  );
}

export {
  FormField,
  FormLabel,
  FormDescription,
  FormFieldError,
  FormGroup,
  FormSection,
};
