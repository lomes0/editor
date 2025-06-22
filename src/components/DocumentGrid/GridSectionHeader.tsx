"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { gridSectionStyles } from "./styles";

interface GridSectionHeaderProps {
  /** Title text for the section */
  title: string;
  /** Optional icon to display beside the title */
  icon?: React.ReactNode;
  /** Optional count of items in the section */
  count?: number;
  /** Optional action component to display on the right */
  action?: React.ReactNode;
}

/**
 * A consistent header component for grid sections
 */
const GridSectionHeader: React.FC<GridSectionHeaderProps> = ({
  title,
  icon,
  count,
  action,
}) => {
  const theme = useTheme();
  const styles = gridSectionStyles(theme);

  return (
    <Box sx={styles.container}>
      <Box sx={styles.titleContainer}>
        {icon && <Box sx={styles.iconWrapper}>{icon}</Box>}
        <Typography variant="h6" component="h2" sx={styles.title}>
          {title}
          {count !== undefined && (
            <Typography
              component="span"
              variant="body2"
              sx={styles.counter}
              aria-label={`${count} items`}
            >
              {count}
            </Typography>
          )}
        </Typography>
      </Box>

      {action && (
        <Box sx={styles.actionContainer}>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default GridSectionHeader;
