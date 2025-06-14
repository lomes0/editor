"use client"
import * as React from 'react';
import { User, UserDocument, DocumentType } from '@/types';
import { memo } from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import DocumentCard from './DocumentCard';
import DirectoryCard from './DirectoryCard';

// Main component that decides whether to render a document or directory card
const CardSelector: React.FC<{ userDocument?: UserDocument, user?: User, sx?: SxProps<Theme> }> = memo(({ userDocument, user, sx }) => {
  // Early return for loading state
  if (!userDocument) {
    return <DocumentCard userDocument={undefined} user={user} sx={sx} />;
  }

  const document = userDocument.local || userDocument.cloud;
  const isDirectory = document?.type === DocumentType.DIRECTORY;

  if (isDirectory) {
    return <DirectoryCard userDocument={userDocument} user={user} sx={sx} />;
  } else {
    return <DocumentCard userDocument={userDocument} user={user} sx={sx} />;
  }
});

export default CardSelector;
