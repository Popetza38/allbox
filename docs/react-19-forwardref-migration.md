# React 19 forwardRef Migration Guide

## Current Status

All components in the codebase use `forwardRef` correctly and are compatible with React 19.

## React 19 Changes

In React 19, you can now pass `ref` as a regular prop to function components:

```tsx
// Before (React 18)
const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  (props, ref) => <div ref={ref} {...props} />
);

// After (React 19) - ref can be passed directly
const MyComponent = ({ ref, ...props }: MyComponentProps & { ref?: Ref<HTMLDivElement> }) => (
  <div ref={ref} {...props} />
);
```

## Components Using forwardRef

The following UI components use `forwardRef` (from shadcn/ui):
- Button
- Dialog
- Input
- Textarea
- Select
- Tabs
- Tooltip
- Toast
- Toggle
- Table
- ScrollArea
- Slider
- Separator
- RadioGroup
- Popover
- Progress
- Pagination
- NavigationMenu
- Label
- Link (custom)

## Migration Strategy

### Priority: LOW

Current `forwardRef` usage works perfectly with React 19. No immediate migration needed.

### When to Migrate

Consider migrating to the new pattern when:
1. Refactoring individual components for other reasons
2. Building new components
3. Needing to reduce boilerplate in simple wrapper components

### Example Migration

**Current (button.tsx):**
```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";
```

**React 19 Pattern (when ready to migrate):**
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  // ... other props
}

const Button = ({ className, variant, size, asChild = false, ref, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
};
```

## Notes

- `forwardRef` is NOT deprecated in React 19
- Both patterns work correctly
- The new pattern is simpler for components that just need to pass ref through
- For complex components (like Dialog with Radix), `forwardRef` may still be preferred
