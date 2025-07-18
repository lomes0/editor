import { alpha } from "@mui/material/styles";

/**
 * Card component theme constants
 * These values can be adjusted globally to maintain consistency
 */
export const cardTheme = {
  // Layout - Responsive card dimensions
  borderRadius: 4,
  minHeight: {
    document: "clamp(280px, 20vw, 320px)", // Responsive height
    directory: "clamp(280px, 20vw, 320px)",
  },
  maxWidth: "400px", // Prevent cards from becoming too wide

  // Content areas - Better balance
  contentRatio: {
    top: "70%", // More space for content preview with better centering
    bottom: "30%",
  },

  // Spacing - Following 8px grid system
  spacing: {
    contentPadding: 2,
    chipGap: 0.75, // Increased for better visual separation
    titleMargin: 1, // More breathing room for titles
    cardGap: 3, // Space between cards in grid
  },

  // Typography - Improved hierarchy
  typography: {
    titleSize: "1.125rem", // Slightly larger for better readability
    titleWeight: 600,
    titleLineHeight: 1.3, // Better line height for readability
    subtitleSize: "0.875rem",
    subtitleWeight: 400,
    subtitleLineHeight: 1.4,
  },

  // Colors and effects - Enhanced visual feedback
  colors: {
    border: "divider",
    sortChipBg: alpha("#000", 0.08), // Slightly more contrast
    cardBackground: "background.paper",
    shadow: {
      default: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
      hover: "0 4px 12px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
      focus: "0 0 0 3px rgba(25,118,210,0.3)",
      active: "0 2px 8px rgba(0,0,0,0.16)",
    },
    focus: "primary.main",
    overlay: {
      light: alpha("#000", 0.04),
      medium: alpha("#000", 0.08),
      heavy: alpha("#000", 0.12),
    },
  },

  // Animation - Smoother transitions
  animation: {
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    hoverTransform: "translateY(-2px) scale(1.02)", // Subtle scale effect
    focusTransform: "scale(1.02)",
    duration: {
      fast: 150,
      standard: 250,
      slow: 350,
    },
    timing: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      entrance: "cubic-bezier(0, 0, 0.2, 1)",
      exit: "cubic-bezier(0.4, 0, 1, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },

  // Icons and badges - Scalable sizes
  iconSizes: {
    folderIcon: "clamp(48px, 8vw, 64px)",
    folderAvatar: "clamp(80px, 12vw, 104px)",
    actionIcon: 20,
    chipIcon: 16,
  },

  // ActionBar - Better proportions
  actionBar: {
    height: "56px", // Standard Material Design height
    minHeight: "48px",
  },

  // Accessibility - Enhanced support
  accessibility: {
    focusRingWidth: 2,
    focusRingOffset: 2,
    minimumTouchTarget: 44, // WCAG AA standard
    highContrastBorder: "2px solid",
    reducedMotion: {
      transition: "none",
      transform: "none",
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};
