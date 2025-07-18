# SideBar Component Decomposition Plan

## Problem:

Single 560+ line component handling multiple responsibilities:

- Navigation rendering
- Domain management
- User authentication display
- File browser integration
- Mobile/desktop responsive behavior

## Proposed Structure:

```
src/components/Layout/SideBar/
├── index.tsx                    # Main SideBar component (150-200 lines)
├── hooks/
│   ├── useSidebarState.ts      # Sidebar open/close state management
│   ├── useDomainManagement.ts  # Domain loading and management
│   └── useNavigationSafety.ts  # Edit mode navigation handling
├── components/
│   ├── SidebarHeader.tsx       # Logo and toggle button
│   ├── MainNavigation.tsx      # Home, New Domain navigation
│   ├── DomainNavigation.tsx    # Domain list and management
│   ├── FileBrowserSection.tsx  # File browser integration
│   └── UserSection.tsx         # User avatar and authentication
└── styles/
    ├── sidebar.styles.ts       # Consolidated sidebar styles
    └── domain.styles.ts        # Domain-specific styles
```

## Benefits:

1. **Single Responsibility**: Each component has one clear purpose
2. **Easier Testing**: Smaller components are easier to unit test
3. **Better Reusability**: Components can be reused in other contexts
4. **Improved Maintainability**: Changes are localized to specific files
5. **Better Developer Experience**: Smaller files are easier to navigate

## Implementation Example:

### SidebarHeader.tsx

```tsx
interface SidebarHeaderProps {
  open: boolean;
  onToggle: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ open, onToggle }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", padding: 1 }}>
      {open && <Logo />}
      {!open && <LogoIcon />}
      <IconButton onClick={onToggle}>
        {open ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>
    </Box>
  );
};
```

### DomainNavigation.tsx

```tsx
interface DomainNavigationProps {
  domains: Domain[];
  currentSlug?: string;
  open: boolean;
  isLoading: boolean;
}

const DomainNavigation: React.FC<DomainNavigationProps> = ({
  domains,
  currentSlug,
  open,
  isLoading,
}) => {
  if (isLoading) return <DomainLoadingSkeleton />;
  if (domains.length === 0) return null;

  return (
    <Box role="navigation" aria-label="Domain navigation">
      <DomainHeader open={open} />
      <DomainList
        domains={domains}
        currentSlug={currentSlug}
        open={open}
      />
    </Box>
  );
};
```
