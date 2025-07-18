"use client";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { usePathname } from "next/navigation";

interface UseSidebarStateReturn {
  open: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

/**
 * Custom hook to manage sidebar open/close state
 * Handles mobile/desktop behavior automatically
 */
export const useSidebarState = (): UseSidebarStateReturn => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();

  const [open, setOpen] = useState(!isMobile);

  const toggleSidebar = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // Close drawer on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [pathname, isMobile]);

  // Update open state when screen size changes
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  return {
    open,
    toggleSidebar,
    isMobile,
  };
};
