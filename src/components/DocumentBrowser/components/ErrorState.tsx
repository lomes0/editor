"use client";
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { ArrowBack, Folder } from "@mui/icons-material";
import Link from "next/link";

interface ErrorStateProps {
  directoryId?: string;
  domainInfo?: any;
}

/**
 * Error state component shown when directory is not found
 * Provides navigation back to parent or root
 */
const ErrorState: React.FC<ErrorStateProps> = ({ directoryId, domainInfo }) => {
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
          alignItems: "center",
          p: 4,
          gap: 2,
        }}
      >
        <Folder
          sx={{
            width: 64,
            height: 64,
            color: "text.secondary",
            opacity: 0.6,
          }}
        />
        <Typography variant="h6">Directory not found</Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {directoryId
            ? "The directory you're looking for doesn't exist or has been removed."
            : "The requested directory could not be found."}
        </Typography>
        <Button
          component={Link}
          href={domainInfo ? `/domains/${domainInfo.slug}` : "/browse"}
          startIcon={<ArrowBack />}
          variant="contained"
          sx={{ borderRadius: 1.5, mt: 2 }}
        >
          Back to {domainInfo ? `${domainInfo.name}` : "Document Browser"}
        </Button>
      </Box>
    </Container>
  );
};

export default ErrorState;
