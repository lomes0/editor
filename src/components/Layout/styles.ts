"use client";

// This file contains utility functions to ensure consistent styling
// between server and client rendering to prevent hydration mismatches

import { SxProps, Theme } from "@mui/material/styles";

// These are constant style objects that won't change between server and client
// They replace inline sx props that can cause hydration mismatches

export const styles = {
  divider: {
    mt: 0,
    mb: 1,
  },
  dividerBottom: {
    mt: "auto",
    mb: 0.25, // Reduced from 0.5 to 0.25
  },
  sectionBox: {
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    pb: 0.5, // Reduced from 1 to 0.5
  },
  userBox: {
    display: "flex",
    flexDirection: "column",
    pt: 0.25, // Reduced from 0.5 to 0.25
    pb: 1,
  },
};
