"use client";
import React from "react";
import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { SxProps, Theme } from "@mui/material/styles";

// Animation for the skeleton loader
const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
`;

interface SkeletonCardProps {
  /** Additional styles to apply */
  sx?: SxProps<Theme>;
}

/**
 * A skeleton card component to show while documents are loading
 */
const SkeletonCard: React.FC<SkeletonCardProps> = ({ sx }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        animation: `${pulse} 1.5s ease-in-out infinite`,
        ...sx,
      }}
    >
      {/* Card top content */}
      <Box
        sx={{
          width: "100%",
          height: "160px",
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Skeleton
          variant="rectangular"
          width="80%"
          height="80%"
          animation="wave"
        />
      </Box>

      {/* Card content */}
      <Box
        sx={{
          p: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Skeleton variant="text" width="70%" height={28} animation="wave" />
        <Box sx={{ height: 8 }} />
        <Skeleton variant="text" width="40%" animation="wave" />
      </Box>

      {/* Card actions */}
      <Box
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton variant="rounded" width={60} height={24} animation="wave" />
          <Skeleton variant="rounded" width={40} height={24} animation="wave" />
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton
            variant="circular"
            width={24}
            height={24}
            animation="wave"
          />
          <Skeleton
            variant="circular"
            width={24}
            height={24}
            animation="wave"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SkeletonCard;
