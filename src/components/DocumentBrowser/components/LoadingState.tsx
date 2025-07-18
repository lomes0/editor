"use client";
import React from "react";
import { Box, Container, Skeleton } from "@mui/material";
import DocumentGrid from "../../DocumentGrid";

/**
 * Loading state component for the document browser
 * Shows skeleton UI while data is being loaded
 */
const LoadingState: React.FC = () => {
  return (
    <Container
      maxWidth={false}
      sx={{
        py: 4,
        px: { xs: 2, sm: 3, md: 4, lg: 5 },
        maxWidth: { xs: "100%", sm: "100%", md: "2000px", lg: "2200px" },
        mx: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          width: "100%",
        }}
      >
        {/* Header skeleton */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: { xs: "wrap", md: "nowrap" },
            gap: 2,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Skeleton variant="text" width={200} height={40} />
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: { xs: "wrap", sm: "nowrap" },
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Skeleton variant="rounded" width={140} height={40} />
            <Skeleton variant="rounded" width={140} height={40} />
            <Skeleton variant="rounded" width={180} height={40} />
          </Box>
        </Box>

        {/* Content skeleton */}
        <DocumentGrid
          items={[]}
          isLoading={true}
          skeletonCount={3}
        />

        <DocumentGrid
          items={[]}
          isLoading={true}
          skeletonCount={6}
        />
      </Box>
    </Container>
  );
};

export default LoadingState;
