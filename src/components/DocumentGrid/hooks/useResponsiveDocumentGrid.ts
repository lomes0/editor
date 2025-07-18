import { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

/**
 * Custom hook for responsive document grid layout calculations
 * Provides optimal column distribution based on screen size
 */
export const useResponsiveDocumentGrid = () => {
  const theme = useTheme();

  // Responsive breakpoints for better grid layout
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));

  // Calculate optimal grid sizing based on screen size
  const gridSizing = useMemo(() => {
    if (isXs) return { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }; // 1 column on mobile
    if (isSm) return { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }; // 2 columns on small tablets
    if (isMd) return { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }; // 3 columns on medium screens
    if (isLg) return { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }; // 4 columns on large screens
    return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }; // 5 columns on XL screens
  }, [isXs, isSm, isMd, isLg]);

  // Return breakpoint information for conditional logic
  const breakpointInfo = useMemo(() => ({
    isXs,
    isSm,
    isMd,
    isLg,
    isXl: !isXs && !isSm && !isMd && !isLg,
  }), [isXs, isSm, isMd, isLg]);

  return {
    gridSizing,
    breakpointInfo,
  };
};
