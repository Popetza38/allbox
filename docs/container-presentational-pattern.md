# Container/Presentational Component Pattern

## Overview

The Container/Presentational pattern separates components into:
- **Container Components**: Handle logic, state, data fetching
- **Presentational Components**: Handle UI rendering only

## Benefits

1. **Separation of Concerns**: Logic separate from UI
2. **Reusability**: Presentational components can be reused with different data sources
3. **Testability**: Easier to test logic and UI independently
4. **Maintainability**: Changes to data fetching don't affect UI components

## Implementation Examples

### Example 1: DubbedContent (Already Implemented)

**Container:** `src/app/sulih-suara/content.tsx`
```tsx
export default function SulihSuaraContent() {
  const { language } = useLanguage();
  return (
    <DubbedProvider language={language}>
      <DubbedContentInner />
    </DubbedProvider>
  );
}
```

**Presentational:** `src/app/sulih-suara/DubbedContentInner.tsx`
```tsx
function DubbedContentInner() {
  const { state, dramas, isLoading, setClassify, nextPage, prevPage } = useDubbedContext();
  // Pure UI rendering using context data
}
```

### Example 2: SearchDialog (Already Implemented)

**Container/Logic:** `src/contexts/SearchContext.tsx`
- Manages search state
- Provides actions via context

**Presentational:** `src/components/SearchDialog.tsx`
- Renders search UI
- Uses context for state/actions

### Example 3: DramaGrid (Partially Implemented)

**Current:** Mix of container and presentational

**Recommended separation:**

**Container Component:**
```tsx
// DramaGridContainer.tsx
export function DramaGridContainer({ endpoint, language }: Props) {
  const { data, isLoading } = useDramas(endpoint, language);
  return (
    <DramaGrid
      dramas={data}
      isLoading={isLoading}
      language={language}
      renderHeader={() => <DramaGridHeader endpoint={endpoint} />}
    />
  );
}
```

**Presentational Component:**
```tsx
// DramaGrid.tsx
export function DramaGrid({ dramas, isLoading, language, renderHeader }: Props) {
  // Pure rendering, no data fetching
}
```

## Pattern Guidelines

### Container Components Should:
- Fetch data
- Manage state
- Handle business logic
- Provide data to presentational children
- Be named with "Container" suffix or be colocated with presentational component

### Presentational Components Should:
- Receive data via props
- Render UI only
- Not fetch data
- Not manage complex state
- Be reusable with different data sources

### File Organization

```
src/
├── components/
│   ├── DramaGrid/
│   │   ├── index.tsx          # Presentational component
│   │   ├── DramaGridContainer.tsx  # Container component
│   │   └── types.ts           # Shared types
```

Or colocated:
```
src/
├── components/
│   ├── DramaGrid.tsx          # Presentational
│   ├── DramaGridContainer.tsx # Container (optional if simple)
```

## When to Use This Pattern

**Use when:**
- Component needs data fetching
- Complex state management required
- Component will be reused with different data sources
- Testing requires mocking data

**Skip when:**
- Component is simple (e.g., Button, Input)
- Component is only used once
- No data fetching or complex state

## Existing Components Following This Pattern

| Component | Container | Presentational | Location |
|-----------|-----------|----------------|----------|
| DubbedContent | `content.tsx` | `DubbedContentInner.tsx` | `app/sulih-suara/` |
| SearchDialog | `SearchContext.tsx` | `SearchDialog.tsx` | `contexts/`, `components/` |
| DramaCard | Context-based | Component with sub-components | `components/DramaCard.tsx` |
| DramaGrid | Can use `renderCard` prop | Main component | `components/DramaGrid.tsx` |

## Migration Checklist

When adding new features:
- [ ] Identify if data fetching is needed
- [ ] Create presentational component first (UI only)
- [ ] Create container component or use existing context
- [ ] Ensure presentational component is reusable
- [ ] Test presentational component with mock data
- [ ] Test container component with real data

## Naming Conventions

- **Container**: `<ComponentName>Container` or colocated file
- **Presentational**: `<ComponentName>` or `<ComponentName>Inner` (when colocated)
- **Context**: `<Feature>Context` or `<Feature>Provider`

## References

- [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca82086fa1a)
- [React Hooks: Separation of Concerns](https://kentcdodds.com/blog/application-state-management-with-react)
