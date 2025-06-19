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
  const defaultSx = {
    width: "400px", // Make cards wider (increased from 360px)
    ...sx,
  };

  // Early return for loading state
  if (!userDocument) {
    return <DocumentCard userDocument={undefined} user={user} sx={defaultSx} />;
  }

  const document = userDocument.local || userDocument.cloud;
  const isDirectory = document?.type === DocumentType.DIRECTORY;

  if (isDirectory) {
    return (
      <DirectoryCard userDocument={userDocument} user={user} sx={defaultSx} />
    );
  } else {
    return (
      <DocumentCard userDocument={userDocument} user={user} sx={defaultSx} />
    );
  }
});

export default CardSelector;
