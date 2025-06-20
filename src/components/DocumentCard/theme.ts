import { alpha } from "@mui/material/styles";

/**
 * Card component theme constants
 * These values can be adjusted globally to maintain consistency
 */
export const cardTheme = {
  // Layout
  borderRadius: 5.5,
  minHeight: {
    document: "300px",
    directory: "300px", // Updated to match document height
  },

  // Content areas
  contentRatio: {
    top: "60%",
    bottom: "40%",
  },

  // Spacing
  spacing: {
    contentPadding: 2,
    chipGap: 0.5,
    titleMargin: 0.1,
  },

  // Typography
  typography: {
    titleSize: "1rem",
    titleWeight: 600,
  },

  // Colors and effects
  colors: {
    border: "divider",
    sortChipBg: alpha("#000", 0.05),
    shadow: {
      default: "0 2px 8px rgba(0,0,0,0.05)",
      hover: "0 8px 16px rgba(0,0,0,0.1)",
    },
  },

  // Animation
  animation: {
    transition: "all 0.2s ease-in-out",
    hoverTransform: "translateY(-4px)",
  },

  // Icons and badges
  iconSizes: {
    folderIcon: 56,
    folderAvatar: 96,
  },

  // ActionBar
  actionBar: {
    height: "60px",
  },
};
