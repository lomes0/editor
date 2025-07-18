"use client";
import React from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { CreateNewFolder, Folder, PostAdd } from "@mui/icons-material";

interface EmptyStateProps {
  directoryId?: string;
  domainInfo?: any;
  onCreateDocument: () => void;
  onCreateDirectory: () => void;
}

/**
 * Empty state component shown when no documents are found
 * Provides contextual messaging and quick actions
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  directoryId,
  domainInfo,
  onCreateDocument,
  onCreateDirectory,
}) => {
  const getEmptyStateContent = () => {
    if (directoryId) {
      return {
        icon: (
          <Folder
            sx={{
              width: 64,
              height: 64,
              color: "text.secondary",
              opacity: 0.6,
            }}
          />
        ),
        title: "This folder is empty",
        description: "Create a new document or folder to get started",
      };
    }

    if (domainInfo) {
      return {
        icon: (
          <PostAdd
            sx={{
              width: 64,
              height: 64,
              color: "text.secondary",
              opacity: 0.6,
            }}
          />
        ),
        title: `No documents in ${domainInfo.name} yet`,
        description:
          "Create a document or folder in this domain to get started",
      };
    }

    return {
      icon: (
        <PostAdd
          sx={{ width: 64, height: 64, color: "text.secondary", opacity: 0.6 }}
        />
      ),
      title: "No personal documents found",
      description:
        "Create a new document or folder to get started (Items in domains are not shown here)",
    };
  };

  const { icon, title, description } = getEmptyStateContent();

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 6,
        gap: 2,
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      {icon}
      <Typography variant="h6">{title}</Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
      >
        {description}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<PostAdd />}
          onClick={onCreateDocument}
          sx={{ borderRadius: 1.5, mr: 2 }}
        >
          New Document
        </Button>
        <Button
          variant="outlined"
          startIcon={<CreateNewFolder />}
          onClick={onCreateDirectory}
          sx={{ borderRadius: 1.5 }}
        >
          New Folder
        </Button>
      </Box>
    </Paper>
  );
};

export default EmptyState;
