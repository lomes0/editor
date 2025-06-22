import React from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { User, UserDocument } from "@/types";
import DraggableDocumentCard from "./DocumentCard/DraggableDocumentCard";
import SkeletonCard from "./DocumentCard/SkeletonCard";
import { SxProps, Theme } from "@mui/material/styles";

interface DocumentGridProps {
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
}

/**
 * A reusable grid component for displaying documents or directories
 * with consistent spacing and responsive behavior
 */
const DocumentGrid: React.FC<DocumentGridProps> = ({
  items,
  user,
  currentDirectoryId,
  title,
  titleIcon,
  sx,
  onMoveComplete,
  isLoading = false,
  skeletonCount = 4,
}) => {
  // If no items and not loading, don't render anything
  if (items.length === 0 && !isLoading) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        ...sx,
      }}
    >
      {title && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          {titleIcon && (
            <Box sx={{ mr: 1, color: "primary.main" }}>{titleIcon}</Box>
          )}
          <Typography variant="h6" component="h2">
            {title} {!isLoading && `(${items.length})`}
          </Typography>
        </Box>
      )}

      <Grid
        container
        spacing={3}
        sx={{
          width: "100%",
          marginTop: 0,
        }}
      >
        {isLoading
          ? (
            // Show skeleton cards when loading
            Array.from({ length: skeletonCount }).map((_, index) => (
              <Grid
                key={`skeleton-${index}`}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3,
                  xl: 2.4,
                }}
              >
                <SkeletonCard />
              </Grid>
            ))
          )
          : (
            // Show actual items
            items.map((item) => (
              <Grid
                key={item.id}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3,
                  xl: 2.4,
                }}
              >
                <DraggableDocumentCard
                  userDocument={item}
                  user={user}
                  currentDirectoryId={currentDirectoryId}
                  onMoveComplete={onMoveComplete}
                />
              </Grid>
            ))
          )}
      </Grid>
    </Box>
  );
};

export default DocumentGrid;
