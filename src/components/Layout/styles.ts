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
    mb: 1,
  },
  sectionBox: {
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    pb: 2,
  },
  userBox: {
    display: "flex",
    flexDirection: "column",
    pt: 1,
    pb: 1,
  }
};
