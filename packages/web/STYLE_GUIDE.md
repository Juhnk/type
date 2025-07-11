# TypeAmp Style Guide

## Overview

This style guide documents the design system decisions, patterns, and migration guide for the TypeAmp application. It serves as the single source of truth for all UI-related decisions.

## Design System Architecture

### 1. Design Tokens

All design decisions are encoded as CSS custom properties in `/src/styles/design-tokens.css`:

- **Spacing**: Based on a 4px grid system (`--space-*`)
- **Typography**: Consistent type scale with line heights (`--text-*`)
- **Shadows**: Progressive elevation system (`--shadow-*`)
- **Animation**: Standardized durations and easing (`--duration-*`, `--ease-*`)
- **Colors**: Semantic color tokens that adapt to themes

### 2. Tailwind Configuration

Custom Tailwind configuration extends the default with our design tokens:

- All spacing values map to CSS custom properties
- Border radius uses predefined tokens
- Shadows follow our elevation system
- Typography scale is consistent across the app

### 3. Component Architecture

Components follow these principles:

- **Composition over Configuration**: Small, focused components
- **Accessibility First**: ARIA attributes and keyboard navigation
- **Theme Agnostic**: Use semantic colors only
- **Responsive by Default**: Mobile-first approach

## Key Design Decisions

### Spacing System

We use a 4px base unit with a scale that provides enough flexibility without being overwhelming:

```
4px  (--space-1)  - Micro spacing
8px  (--space-2)  - Tight spacing
12px (--space-3)  - Compact spacing
16px (--space-4)  - Default spacing
24px (--space-6)  - Comfortable spacing
32px (--space-8)  - Loose spacing
```

**Why?** This scale provides clear visual hierarchy while maintaining consistency.

### Typography Scale

Our type scale uses a 1.25 ratio for headings with optimized line heights:

```
14px/20px - Small text (descriptions, labels)
16px/24px - Body text (default)
18px/28px - Large body text
20px/28px - Small headings
24px/32px - Default headings
30px/36px - Large headings
```

**Why?** This scale ensures readability across devices while maintaining visual hierarchy.

### Border Radius

Consistent radius values create visual cohesion:

```
6px  (--radius-sm)  - Small elements (badges, chips)
8px  (--radius-md)  - Default elements (inputs, buttons)
10px (--radius-lg)  - Cards and containers
14px (--radius-xl)  - Large cards, modals
```

**Why?** Slightly rounded corners feel modern without being overly playful.

### Elevation System

Progressive shadows indicate hierarchy:

```
shadow-xs  - Subtle elevation (inputs)
shadow-sm  - Low elevation (cards, buttons)
shadow-md  - Medium elevation (dropdowns)
shadow-lg  - High elevation (modals)
shadow-xl  - Maximum elevation (popovers)
```

**Why?** Shadows provide depth cues without overwhelming the interface.

### Color Philosophy

- **Semantic Only**: Never use direct color values
- **Theme Agnostic**: Colors adapt to user's theme preference
- **Accessibility**: All color combinations meet WCAG AA standards
- **Predictable**: Consistent color meanings across the app

#### Semantic Color Tokens

We use semantic colors for consistent meaning across the application:

```
Primary     - Brand color, primary actions
Success     - Positive states, confirmations, good performance
Warning     - Caution states, warnings, attention needed
Error       - Error states, destructive actions, failures
Info        - Informational states, neutral highlights
Muted       - Subdued content, backgrounds, borders
Foreground  - Primary text color
Background  - Page and component backgrounds
```

**Usage Examples:**

```tsx
// Status indicators
className = 'text-success'; // Good performance (95%+ accuracy)
className = 'text-warning'; // Moderate performance
className = 'text-error'; // Errors or poor performance
className = 'text-info'; // Informational highlights

// Backgrounds
className = 'bg-success-soft'; // Subtle success background
className = 'bg-error-soft'; // Subtle error background
className = 'bg-warning-soft'; // Subtle warning background
className = 'bg-info-soft'; // Subtle info background

// Borders
className = 'border-success'; // Success state borders
className = 'border-error'; // Error state borders
```

### Animation Principles

- **Purposeful**: Animations have clear UX purpose
- **Consistent**: Use predefined duration and easing tokens
- **Performant**: Prefer transform and opacity animations
- **Accessible**: Respect prefers-reduced-motion

## Component Patterns

### Forms

```tsx
// Standard form field pattern
<FormField>
  <FormLabel htmlFor="input-id" required>
    Label Text
  </FormLabel>
  <Input id="input-id" />
  <FormFieldError>Error message</FormFieldError>
</FormField>
```

### Buttons

```tsx
// Primary action (one per screen)
<Button>Primary Action</Button>

// Secondary actions
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>

// Destructive actions (require confirmation)
<Button variant="destructive">Delete</Button>
```

### Cards

```tsx
// Standard card layout
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
  <CardFooter>{/* Actions */}</CardFooter>
</Card>
```

## Do's and Don'ts

### ✅ Do's

1. **Use design tokens** for all spacing, colors, and typography
2. **Test in both themes** (light and dark mode)
3. **Consider mobile first** when designing layouts
4. **Use semantic HTML** elements
5. **Add ARIA labels** for icon-only buttons
6. **Keep components focused** on a single responsibility
7. **Document unusual patterns** with comments

### ❌ Don'ts

1. **Don't hardcode values** - use tokens instead
2. **Don't mix spacing scales** - be consistent
3. **Don't create one-off components** - extend existing ones
4. **Don't skip accessibility** - it's not optional
5. **Don't use inline styles** - use utility classes
6. **Don't nest CSS** - keep specificity low
7. **Don't override design tokens** - they exist for consistency

## Migration Guide

### Phase 1: Update Spacing (High Priority)

```tsx
// Before
className = 'px-3 py-2 gap-1.5 mt-4 mb-8';

// After (using consistent scale)
className = 'px-3 py-2 gap-2 mt-4 mb-8';
```

### Phase 2: Update Focus States (High Priority)

```tsx
// Before
className = 'focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';

// After
className = 'focus-ring';
```

### Phase 3: Update Colors (High Priority)

```tsx
// Before
className = 'bg-gray-100 dark:bg-gray-800 text-gray-600';
className = 'text-green-500'; // Hardcoded success color
className = 'bg-red-100'; // Hardcoded error background

// After
className = 'bg-muted text-muted-foreground';
className = 'text-success'; // Semantic success color
className = 'bg-error-soft'; // Semantic error background
```

### Phase 4: Update Shadows (Medium Priority)

```tsx
// Before
className = 'shadow shadow-md';

// After (use consistent scale)
className = 'shadow-sm'; // or shadow-md, shadow-lg
```

### Phase 5: Update Border Radius (Low Priority)

```tsx
// Before
className = 'rounded rounded-lg rounded-xl';

// After (pick one consistent value)
className = 'rounded-md'; // for inputs/buttons
className = 'rounded-lg'; // for cards
```

### Phase 6: Update Transitions (Low Priority)

```tsx
// Before
className = 'transition-colors duration-200';
className = 'transition-all';

// After
className = 'transition-base'; // Standard transition for most elements
// Note: Keep transition-all only for width/height animations
```

## Tools and Resources

### Development Tools

1. **Component Guidelines**: `/src/styles/COMPONENT_GUIDELINES.md`
2. **Design Tokens**: `/src/styles/design-tokens.css`
3. **Tailwind Config**: `/tailwind.config.ts`
4. **Storybook**: Run `npm run storybook` to see components

### VS Code Extensions

Recommended extensions for consistent development:

- Tailwind CSS IntelliSense
- Prettier
- ESLint
- axe Accessibility Linter

### Testing Checklist

Before committing component changes:

- [ ] Component uses design tokens
- [ ] Works in light and dark mode
- [ ] Has proper focus states
- [ ] Is keyboard navigable
- [ ] Follows spacing conventions
- [ ] Uses semantic colors
- [ ] Is responsive
- [ ] Has been tested with screen reader
- [ ] Storybook story is updated
- [ ] No hardcoded values

## Common Patterns

### Loading States

```tsx
// Inline loading
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>

// Full page loading
<div className="flex items-center justify-center min-h-screen">
  <Loader2 className="h-8 w-8 animate-spin" />
</div>
```

### Empty States

```tsx
<div className="py-12 text-center">
  <Icon className="text-muted-foreground mx-auto h-12 w-12" />
  <h3 className="text-heading-sm mt-2">No results found</h3>
  <p className="text-body-sm text-muted-foreground mt-1">
    Try adjusting your filters
  </p>
</div>
```

### Error States

```tsx
// Inline error
<FormFieldError>This field is required</FormFieldError>

// Page error
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

## Future Considerations

As the design system evolves, we plan to:

1. Add more semantic color tokens for specific use cases
2. Introduce component-level CSS custom properties
3. Create more composite components for common patterns
4. Add animation presets for common interactions
5. Develop a visual regression testing system

## Questions?

If you have questions about the design system:

1. Check this guide first
2. Look at existing component implementations
3. Review the Storybook examples
4. Ask in the team chat

Remember: **Consistency creates clarity**. When in doubt, follow existing patterns.
