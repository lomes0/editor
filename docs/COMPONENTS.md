# DocumentGrid Component

The DocumentGrid component is a high-performance, responsive grid for displaying document and directory cards in the Math Editor application.

## Features

- **Responsive Layout**: Automatically adjusts columns based on screen size
- **Virtualization**: Uses windowing techniques for efficient rendering of large lists
- **Drag and Drop**: Supports drag-and-drop for document organization
- **Accessibility**: Enhanced keyboard navigation and screen reader support
- **Customizable**: Flexible styling and configuration options

## Usage

```tsx
import DocumentGrid from '@/components/DocumentGrid';

// Basic usage
<DocumentGrid
  items={documents}
  user={currentUser}
  title="Documents"
  titleIcon={<DocumentIcon />}
/>

// With virtualization for large datasets
<DocumentGrid
  items={documents}
  user={currentUser}
  virtualized={true}
  virtualizationThreshold={20}
/>

// With loading state
<DocumentGrid
  isLoading={true}
  skeletonCount={6}
  title="Loading Documents..."
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `UserDocument[]` | `[]` | The documents to display in the grid |
| `user` | `User` | `undefined` | The current user |
| `currentDirectoryId` | `string` | `undefined` | The current directory ID (if any) |
| `title` | `string` | `undefined` | Optional title to display above the grid |
| `titleIcon` | `ReactNode` | `undefined` | Optional icon to display beside the title |
| `sx` | `SxProps<Theme>` | `{}` | Optional additional styles |
| `onMoveComplete` | `() => void` | `undefined` | Optional callback when a document is moved |
| `isLoading` | `boolean` | `false` | Whether the grid is in a loading state |
| `skeletonCount` | `number` | `4` | Number of skeleton cards to show when loading |
| `virtualized` | `boolean` | `true` | Whether to use virtualization for large item sets |
| `virtualizationThreshold` | `number` | `20` | Optional threshold for enabling virtualization |

## Performance Considerations

- Virtualization is automatically enabled for lists with more than 20 items
- On mobile devices, virtualization kicks in at 10 items to improve performance
- For very large lists (100+ items), consider pagination or infinite scrolling

## Accessibility

The DocumentGrid component implements the following accessibility features:

- Proper focus management for keyboard navigation
- ARIA attributes for screen reader support
- High contrast mode support
- Keyboard shortcuts for common actions

## Example: Directory Browser

```tsx
<DocumentBrowser>
  <DocumentGrid
    items={directories}
    title="Folders"
    titleIcon={<FolderIcon />}
    virtualized={true}
  />
  <DocumentGrid
    items={documents}
    title="Documents"
    titleIcon={<DocumentIcon />}
    virtualized={true}
  />
</DocumentBrowser>
```
