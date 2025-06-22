"use client";
import * as React from "react";
import { DocumentType, User, UserDocument } from "@/types";
import { memo } from "react";
import { SxProps, Theme } from "@mui/material/styles";
import DocumentCard from "./DocumentCard";
import DirectoryCard from "./DirectoryCard";

// Main component that decides whether to render a document or directory card
const CardSelector: React.FC<
  { userDocument?: UserDocument; user?: User; sx?: SxProps<Theme> }
> = memo(({ userDocument, user, sx = {} }) => {
  // Apply default size to all cards
  const defaultSx: SxProps<Theme> = {
    width: "100%", // Make cards take full width of their grid cell
    height: "100%", // Make sure card takes full height
    margin: 0, // Reset margin to allow Grid spacing to work
    display: "flex", 
    flexDirection: "column",
  };

  // Combine with any additional styles
  const combinedSx: SxProps<Theme> = { ...defaultSx, ...(sx as any) };

  // Early return for loading state
  if (!userDocument) {
    return <DocumentCard userDocument={undefined} user={user} sx={combinedSx} />;
  }

  const document = userDocument.local || userDocument.cloud;
  const isDirectory = document?.type === DocumentType.DIRECTORY;

  if (isDirectory) {
    return (
      <DirectoryCard userDocument={userDocument} user={user} sx={combinedSx} />
    );
  } else {
    return (
      <DocumentCard userDocument={userDocument} user={user} sx={combinedSx} />
    );
  }
});

// Set display name for debugging
CardSelector.displayName = "CardSelector";

export default CardSelector;
