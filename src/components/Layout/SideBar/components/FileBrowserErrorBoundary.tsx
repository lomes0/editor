"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Refresh, Warning } from "@mui/icons-material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically for the FileBrowser component
 * Provides graceful degradation when file browser fails
 */
export class FileBrowserErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("FileBrowser error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            textAlign: "center",
            minHeight: 120,
          }}
        >
          <Warning
            sx={{
              fontSize: 32,
              color: "warning.main",
              mb: 1,
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            File browser unavailable
          </Typography>
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={this.handleRetry}
            variant="outlined"
          >
            Retry
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
