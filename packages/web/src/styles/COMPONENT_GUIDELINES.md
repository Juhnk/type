# TypeAmp Component Guidelines

This document provides comprehensive guidelines for using and creating components in the TypeAmp design system.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Spacing Conventions](#spacing-conventions)
3. [Typography Guidelines](#typography-guidelines)
4. [Color Usage](#color-usage)
5. [Component Variants](#component-variants)
6. [Interaction States](#interaction-states)
7. [Form Patterns](#form-patterns)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Dark Mode Support](#dark-mode-support)
10. [Responsive Design](#responsive-design)

## Core Principles

1. **Consistency First**: Always use design tokens instead of hardcoded values
2. **Accessibility by Default**: All components must meet WCAG 2.1 AA standards
3. **Performance Matters**: Minimize re-renders and use proper React patterns
4. **Mobile-First**: Design for mobile screens first, then scale up

## Spacing Conventions

### Standard Spacing Scale

Always use the spacing tokens defined in `design-tokens.css`:

```css
/* Use these values for all spacing needs */
--space-0: 0;
--space-1: 0.25rem; /* 4px - Tight spacing */
--space-2: 0.5rem; /* 8px - Compact spacing */
--space-3: 0.75rem; /* 12px - Default small spacing */
--space-4: 1rem; /* 16px - Default medium spacing */
--space-5: 1.25rem; /* 20px - Comfortable spacing */
--space-6: 1.5rem; /* 24px - Default large spacing */
--space-8: 2rem; /* 32px - Extra spacing */
--space-10: 2.5rem; /* 40px - Section spacing */
--space-12: 3rem; /* 48px - Page section spacing */
```

### Usage Guidelines

- **Component Padding**:
  - Small components: `px-3 py-2` (12px / 8px)
  - Default components: `px-4 py-2` (16px / 8px)
  - Large components: `px-6 py-3` (24px / 12px)

- **Component Gaps**:
  - Tight groups: `gap-1` or `gap-2`
  - Default groups: `gap-4`
  - Loose groups: `gap-6` or `gap-8`

- **Form Spacing**:
  - Between form fields: `space-y-4`
  - Between form sections: `space-y-6` or `space-y-8`
  - Label to input: `space-y-2`

## Typography Guidelines

### Type Scale

Use the predefined typography classes:

```css
/* Body Text */
.text-body-sm    /* 14px/20px - Small body text */
.text-body       /* 16px/24px - Default body text */
.text-body-lg    /* 18px/28px - Large body text */

/* Headings */
.text-heading-sm /* 20px/28px - Small headings */
.text-heading    /* 24px/32px - Default headings */
.text-heading-lg /* 30px/36px - Large headings */
```

### Font Weights

- Normal text: `font-normal` (400)
- Emphasized text: `font-medium` (500)
- Headings: `font-semibold` (600)
- Strong emphasis: `font-bold` (700)

### Usage Examples

```tsx
// Page title
<h1 className="text-heading-lg">Page Title</h1>

// Section heading
<h2 className="text-heading">Section Title</h2>

// Card title
<h3 className="text-heading-sm">Card Title</h3>

// Body text
<p className="text-body">Regular paragraph text</p>

// Small text
<p className="text-body-sm text-muted-foreground">Helper text</p>
```

## Color Usage

### Semantic Colors

Always use semantic color tokens:

- **Primary Actions**: `bg-primary text-primary-foreground`
- **Secondary Actions**: `bg-secondary text-secondary-foreground`
- **Destructive Actions**: `bg-destructive text-white`
- **Muted Elements**: `bg-muted text-muted-foreground`
- **Borders**: `border-border`
- **Focus Rings**: `ring-ring`

### Dark Mode

All colors automatically adapt to dark mode. Never use:

- Direct color values (`bg-blue-500`)
- Opacity modifiers without dark mode consideration
- Different dark mode implementations in the same component

## Component Variants

### Button Variants

```tsx
// Primary action (most important)
<Button variant="default">Save Changes</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Ghost button (minimal style)
<Button variant="ghost">Learn More</Button>

// Outline button
<Button variant="outline">View Details</Button>

// Link style
<Button variant="link">Read Documentation</Button>
```

### Size Variants

```tsx
// Small size
<Button size="sm">Small Button</Button>
<Input className="h-input-sm" />

// Default size
<Button>Default Button</Button>
<Input />

// Large size
<Button size="lg">Large Button</Button>
<Input className="h-input-lg" />
```

## Interaction States

### Hover States

- Primary elements: `hover:opacity-95`
- Ghost elements: `hover:bg-accent hover:text-accent-foreground`
- Links: `hover:underline`

### Focus States

All interactive elements must have visible focus states:

```tsx
// Use the focus-ring utility class
<button className="focus-ring">Focusable Button</button>

// Or apply manually
<input className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
```

### Disabled States

```tsx
// Use the disabled-state utility class
<Button className="disabled-state" disabled>Disabled</Button>

// Or apply manually
<input className="disabled:opacity-50 disabled:cursor-not-allowed" disabled />
```

### Loading States

```tsx
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

## Form Patterns

### Basic Form Field

```tsx
import { FormField, FormLabel } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

<FormField>
  <FormLabel htmlFor="email" required>
    Email Address
  </FormLabel>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    aria-required="true"
  />
</FormField>;
```

### Form with Validation

```tsx
<FormField error={errors.username}>
  <FormLabel htmlFor="username" required>
    Username
  </FormLabel>
  <Input
    id="username"
    aria-invalid={!!errors.username}
    aria-describedby={errors.username ? 'username-error' : undefined}
  />
</FormField>
```

### Form Group

```tsx
<FormGroup>
  <FormSection
    title="Personal Information"
    description="Please provide your basic information"
  >
    <FormField>
      <FormLabel htmlFor="name">Full Name</FormLabel>
      <Input id="name" />
    </FormField>

    <FormField>
      <FormLabel htmlFor="email">Email</FormLabel>
      <Input id="email" type="email" />
    </FormField>
  </FormSection>
</FormGroup>
```

## Accessibility Requirements

### Required Attributes

1. **Semantic HTML**: Use proper HTML elements (`button`, `nav`, `main`, etc.)
2. **ARIA Labels**: Add labels for icon-only buttons
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Focus Management**: Proper focus order and visible focus states
5. **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text

### Examples

```tsx
// Icon-only button
<Button size="icon" aria-label="Settings">
  <Settings className="h-4 w-4" />
</Button>

// Form field with description
<FormField>
  <FormLabel htmlFor="password">Password</FormLabel>
  <FormDescription id="password-desc">
    Must be at least 8 characters
  </FormDescription>
  <Input
    id="password"
    type="password"
    aria-describedby="password-desc"
  />
</FormField>

// Loading state
<div role="status" aria-live="polite">
  <Spinner />
  <span className="sr-only">Loading...</span>
</div>
```

## Dark Mode Support

### Guidelines

1. Always use semantic color tokens
2. Test components in both light and dark modes
3. Ensure sufficient contrast in both modes
4. Use consistent opacity values

### Example

```tsx
// Good - uses semantic colors
<div className="bg-card text-card-foreground">
  <p className="text-muted-foreground">Muted text</p>
</div>

// Bad - hardcoded colors
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-500 dark:text-gray-400">Muted text</p>
</div>
```

## Responsive Design

### Breakpoints

- Mobile: Default (< 640px)
- Tablet: `sm:` (≥ 640px)
- Desktop: `md:` (≥ 768px)
- Large: `lg:` (≥ 1024px)

### Responsive Patterns

```tsx
// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">

// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive text
<h1 className="text-2xl sm:text-3xl lg:text-4xl">

// Hide/show elements
<div className="hidden sm:block">Desktop only</div>
<div className="sm:hidden">Mobile only</div>
```

### Mobile-First Example

```tsx
<Card className="/* Mobile (default) */ /* Tablet and up */ /* Desktop and up */ space-y-4 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8">
  <CardHeader>
    <CardTitle className="text-xl sm:text-2xl">Responsive Card</CardTitle>
  </CardHeader>

  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
    {/* Content */}
  </CardContent>
</Card>
```

## Component Creation Checklist

When creating new components, ensure:

- [ ] Uses design tokens for all values
- [ ] Has proper TypeScript types
- [ ] Includes all necessary ARIA attributes
- [ ] Has visible focus states
- [ ] Works in both light and dark modes
- [ ] Is keyboard navigable
- [ ] Has proper disabled states
- [ ] Is responsive
- [ ] Follows naming conventions
- [ ] Has Storybook stories
- [ ] Has unit tests
- [ ] Is documented

## Migration Guide

### Updating Existing Components

1. Replace hardcoded spacing with tokens:

   ```tsx
   // Before
   <div className="px-6 py-4 gap-8">

   // After
   <div className="px-6 py-4 gap-8">
   ```

2. Replace custom focus states:

   ```tsx
   // Before
   <button className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">

   // After
   <button className="focus-ring">
   ```

3. Update hover states:

   ```tsx
   // Before
   <Button className="hover:bg-primary/90">

   // After
   <Button className="hover:opacity-95">
   ```

4. Use semantic colors:

   ```tsx
   // Before
   <div className="bg-gray-100 dark:bg-gray-800">

   // After
   <div className="bg-muted">
   ```

Remember: Consistency is key. When in doubt, refer to existing components or ask for guidance.
