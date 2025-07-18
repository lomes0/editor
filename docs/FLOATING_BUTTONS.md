# Floating Action Buttons System

This document explains how to use the new floating action buttons system in the Math Editor application.

## Overview

The floating action buttons system provides a way to manage multiple floating buttons that need to appear in the bottom-right corner of the screen without overlapping each other. It uses a React context provider to register buttons and manage their positioning.

## Components

### 1. FloatingActionsContainer

This is the main container component that manages all floating action buttons. It provides a context for registering buttons and displays them in a vertical stack.

### 2. FloatingActionButton

This is a wrapper component that registers a button with the container. It takes a unique ID, a priority level, and the button element as children.

### 3. FloatingActionsProvider

This component wraps the application and provides the floating actions context.

## Usage

### Basic Example

```tsx
import { FloatingActionButton } from "@/components/Layout/FloatingActionsContainer";
import { Fab } from "@mui/material";
import { Add } from "@mui/icons-material";

function MyComponent() {
  return (
    <FloatingActionButton id="my-button" priority={10}>
      <Fab size="medium" color="primary" aria-label="add">
        <Add />
      </Fab>
    </FloatingActionButton>
  );
}
```

### Consistency Guidelines

All floating action buttons should follow these consistency rules:

- **Size**: Always use `size="medium"` for all floating action buttons to ensure visual consistency
- **Priority**: Use appropriate priority levels to control stacking order
- **Styling**: Maintain consistent styling patterns for similar types of actions

### Priority Levels

Buttons are sorted by priority, with higher priority buttons appearing closer to the bottom of the screen (more accessible). Here are some standard priority levels:

- Footer (version info): 5
- Information buttons: 8-10
- Tool buttons: 15-18
- Document edit: 20
- Document save: 25
- ScrollTop button: 30

### Converting Existing Components

To convert an existing component with fixed positioning to use the new system:

1. Remove `position: "fixed"` and related positioning properties
2. Wrap the component with `FloatingActionButton` 
3. Provide a unique ID and appropriate priority

Example:

```tsx
// Before
<Fab
  sx={{
    position: "fixed",
    bottom: 16,
    right: 16,
  }}
>
  <Add />
</Fab>

// After
<FloatingActionButton id="add-button" priority={15}>
  <Fab size="medium">
    <Add />
  </Fab>
</FloatingActionButton>
```

## Tool Containers

For more complex tool containers like MathTools and ImageTools, use the `ToolsContainer` component:

```tsx
import ToolsContainer from "@/components/Tools/ToolsContainer";

function MyToolComponent() {
  return (
    <ToolsContainer id="my-tool" priority={15}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {/* Your tool controls here */}
      </Box>
    </ToolsContainer>
  );
}
```

## Implementation Details

The floating action buttons system is implemented in `/components/Layout/FloatingActionsContainer.tsx`. It uses React's context API to manage button registration and unregistration, and renders buttons in a fixed-position container at the bottom right of the screen.
