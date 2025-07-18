"use client";
import React from "react";
import { Box, List, ListItem, Skeleton } from "@mui/material";

interface DomainLoadingSkeletonProps {
  open: boolean;
  count?: number;
}

/**
 * Loading skeleton for the domains section
 */
export const DomainLoadingSkeleton: React.FC<DomainLoadingSkeletonProps> = ({
  open,
  count = 3,
}) => {
  return (
    <List>
      {Array.from(
        { length: count },
        (_, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2.5,
                py: 0.58,
                minHeight: 36,
              }}
            >
              {!open
                ? (
                  <Skeleton
                    variant="circular"
                    width={24}
                    height={24}
                    sx={{ mx: "auto" }}
                  />
                )
                : (
                  <>
                    <Skeleton
                      variant="circular"
                      width={8}
                      height={8}
                      sx={{ mr: 1.5, ml: 0.5 }}
                    />
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={20}
                    />
                  </>
                )}
            </Box>
          </ListItem>
        ),
      )}
    </List>
  );
};
