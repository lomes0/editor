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
    directory: "300px",
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
    subtitleSize: "0.875rem",
    subtitleWeight: 400,
  },

  // Colors and effects
  colors: {
    border: "divider",
    sortChipBg: alpha("#000", 0.05),
    shadow: {
      default: "0 2px 8px rgba(0,0,0,0.05)",
      hover: "0 8px 16px rgba(0,0,0,0.1)",
      focus: "0 0 0 3px rgba(25,118,210,0.3)",
    },
    focus: "primary.main",
  },

  // Animation
  animation: {
    transition: "all 0.2s ease-in-out",
    hoverTransform: "translateY(-4px)",
    duration: {
      short: 200,
      medium: 300,
      long: 500,
    },
    timing: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      entrance: "cubic-bezier(0, 0, 0.2, 1)",
      exit: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },

  // Icons and badges
  iconSizes: {
    folderIcon: 56,
    folderAvatar: 96,
    actionIcon: 20,
  },

  // ActionBar
  actionBar: {
    height: "60px",
  },

  // Accessibility
  accessibility: {
    focusRingWidth: 2,
    focusRingOffset: 2,
  },
};
