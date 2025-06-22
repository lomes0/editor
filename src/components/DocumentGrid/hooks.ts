"use client";
import { useCallback, useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * A custom hook that provides responsive grid layout calculations
 * for document card grids
 */
export const useResponsiveGrid = () => {
  const theme = useTheme();

  // Responsive breakpoints
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));

  // Calculate columns based on breakpoint
  const columns = useMemo(() => {
    if (isXs) return 1;
    if (isSm) return 2;
    if (isMd) return 3;
    if (isLg) return 4;
    if (isXl) return 5;
    return 3; // Default fallback
  }, [isXs, isSm, isMd, isLg, isXl]);

  // Calculate column widths
  const columnWidth = useCallback(
    (width: number) =>
      Math.floor(width / columns) -
      (parseInt(theme.spacing(3)) * (columns - 1) / columns),
    [columns, theme],
  );

  // Calculate row height based on card height + margin
  const rowHeight = useCallback(
    (cardHeight: number = 300) => cardHeight + parseInt(theme.spacing(3)),
    [theme],
  );

  return {
    columns,
    columnWidth,
    rowHeight,
    breakpoints: {
      isXs,
      isSm,
      isMd,
      isLg,
      isXl,
    },
  };
};

/**
 * A custom hook that determines whether to use virtualization
 * based on item count and device capabilities
 */
export const useVirtualization = (
  itemCount: number,
  options: {
    threshold?: number;
    mobileThreshold?: number;
    forceVirtualize?: boolean;
  } = {},
) => {
  const {
    threshold = 20,
    mobileThreshold = 10,
    forceVirtualize = false,
  } = options;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Use a lower threshold for mobile devices
  const effectiveThreshold = isMobile ? mobileThreshold : threshold;

  const shouldVirtualize = forceVirtualize || itemCount >= effectiveThreshold;

  return {
    shouldVirtualize,
    isMobile,
  };
};
