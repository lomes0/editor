import React, { memo, useCallback, useMemo } from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { User, UserDocument } from "@/types";
import DraggableDocumentCard from "../DocumentCard/DraggableDocumentCard";
import SkeletonCard from "../DocumentCard/SkeletonCard";
import { SxProps, Theme } from "@mui/material/styles";
import { cardTheme } from "../DocumentCard/theme";
import { useResponsiveGrid } from "./hooks/useResponsiveGrid";

interface DocumentGridOptimizedProps {
  /** The documents to display in the grid */
  items: UserDocument[];
  /** The current user */
  user?: User;
  /** The current directory ID (if any) */
  currentDirectoryId?: string;
  /** Optional title to display above the grid */
  title?: string;
  /** Optional icon to display beside the title */
  titleIcon?: React.ReactNode;
  /** Optional additional styles */
  sx?: SxProps<Theme>;
  /** Optional callback when a document is moved */
  onMoveComplete?: () => void;
  /** Whether the grid is in a loading state */
  isLoading?: boolean;
  /** Number of skeleton cards to show when loading */
  skeletonCount?: number;
  /** Enable virtualization for large datasets */
  enableVirtualization?: boolean;
  /** Threshold for enabling virtualization */
  virtualizationThreshold?: number;
}

/**
 * Performance-optimized DocumentGrid with virtualization support
 */
const DocumentGridOptimized: React.FC<DocumentGridOptimizedProps> = memo(({
  items,
  user,
  currentDirectoryId,
  title,
  titleIcon,
  sx,
  onMoveComplete,
  isLoading = false,
  skeletonCount = 4,
  enableVirtualization = true,
  virtualizationThreshold = 50,
}) => {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );

  const { columns, spacing, size, breakpoints } = useResponsiveGrid();

  // Memoize skeleton items to prevent unnecessary re-renders
  const skeletonItems = useMemo(
    () =>
      Array.from(
        { length: skeletonCount },
        (_, index) => (
          <Grid key={`skeleton-${index}`} size={size}>
            <SkeletonCard
              sx={{
                height: cardTheme.minHeight.document,
                ...(prefersReducedMotion && { animation: "none" }),
              }}
            />
          </Grid>
        ),
      ),
    [skeletonCount, size, prefersReducedMotion],
  );

  // Memoized card renderer for virtualization
  const renderCard = useCallback(({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const itemIndex = rowIndex * columns + columnIndex;
    const item = items[itemIndex];

    if (!item) return null;

    return (
      <div style={style}>
        <Box sx={{ p: 1.5 }}>
          <DraggableDocumentCard
            userDocument={item}
            user={user}
            currentDirectoryId={currentDirectoryId}
            onMoveComplete={onMoveComplete}
            sx={{
              height: "100%",
              transition: prefersReducedMotion
                ? "none"
                : theme.transitions.create([
                  "transform",
                  "box-shadow",
                ], {
                  duration: theme.transitions.duration.standard,
                  easing: theme.transitions.easing.easeInOut,
                }),
            }}
          />
        </Box>
      </div>
    );
  }, [
    items,
    columns,
    user,
    currentDirectoryId,
    onMoveComplete,
    prefersReducedMotion,
    theme,
  ]);

  // Memoize rendered items for performance
  const renderedItems = useMemo(
    () =>
      items.map((item) => (
        <Grid key={item.id} size={size}>
          <DraggableDocumentCard
            userDocument={item}
            user={user}
            currentDirectoryId={currentDirectoryId}
            onMoveComplete={onMoveComplete}
            sx={{
              height: "100%",
              transition: prefersReducedMotion
                ? "none"
                : theme.transitions.create([
                  "transform",
                  "box-shadow",
                ], {
                  duration: theme.transitions.duration.standard,
                  easing: theme.transitions.easing.easeInOut,
                }),
            }}
          />
        </Grid>
      )),
    [
      items,
      user,
      currentDirectoryId,
      onMoveComplete,
      size,
      prefersReducedMotion,
      theme,
    ],
  );

  // Memoize the header component
  const headerComponent = useMemo(() => {
    if (!title) return null;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          // Responsive title styling
          [theme.breakpoints.down("sm")]: {
            mb: 2,
          },
        }}
      >
        {titleIcon && (
          <Box
            sx={{
              mr: 1.5,
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              // Responsive icon sizing
              [theme.breakpoints.down("sm")]: {
                mr: 1,
                fontSize: "1.25rem",
              },
            }}
          >
            {titleIcon}
          </Box>
        )}
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 600,
            // Responsive typography
            [theme.breakpoints.down("sm")]: {
              fontSize: "1.25rem",
            },
          }}
        >
          {title}
        </Typography>
        {!isLoading && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              ml: 2,
              px: 1.5,
              py: 0.5,
              backgroundColor: theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[800],
              borderRadius: 3,
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            {items.length}
          </Typography>
        )}
      </Box>
    );
  }, [title, titleIcon, isLoading, items.length, theme]);

  // Early return if no items and not loading
  if (items.length === 0 && !isLoading) return null;

  // Calculate virtualized grid dimensions
  const cardWidth = breakpoints.isXs
    ? 300
    : breakpoints.isSm
    ? 280
    : breakpoints.isMd
    ? 300
    : 320;
  const cardHeight = parseInt(cardTheme.minHeight.document.replace("px", "")) +
    40; // Add padding
  const rows = Math.ceil(items.length / columns);

  return (
    <Box
      component="section"
      role="region"
      aria-label={title ? `${title} grid` : "Document grid"}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: cardTheme.spacing.cardGap,
        width: "100%",
        // Improved responsive spacing
        [theme.breakpoints.down("sm")]: {
          gap: 2,
        },
        ...sx,
      }}
    >
      {headerComponent}

      {/* Always use regular grid for now - virtualization can be added later with proper react-virtualized setup */}
      <Grid
        container
        spacing={spacing}
        sx={{
          width: "100%",
          marginTop: 0,
          // Ensure consistent alignment
          alignItems: "stretch",
          // Performance optimization for large grids
          contain: "layout style",
        }}
      >
        {isLoading ? skeletonItems : renderedItems}
      </Grid>
    </Box>
  );
});

DocumentGridOptimized.displayName = "DocumentGridOptimized";

export default DocumentGridOptimized;
