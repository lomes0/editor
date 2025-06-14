"use client"
import * as React from 'react';
import { memo, Suspense } from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import { Badge, Chip, IconButton, Skeleton, Avatar } from '@mui/material';
import { MobileFriendly, Cloud, CloudDone, CloudSync, Public, Workspaces, Security, Share, MoreVert } from '@mui/icons-material';
import { User, UserDocument } from '@/types';
import DocumentActionMenu from './DocumentActionMenu';
import DocumentThumbnail from './DocumentThumbnail';
import ThumbnailSkeleton from './ThumbnailSkeleton';
import { useHydration } from '@/hooks/useHydration';
import BaseCard from './BaseCard';

const DocumentCard: React.FC<{ userDocument?: UserDocument, user?: User, sx?: SxProps<Theme> }> = memo(({ userDocument, user, sx }) => {
  const localDocument = userDocument?.local;
  const cloudDocument = userDocument?.cloud;
  const isLocal = !!localDocument;
  const isCloud = !!cloudDocument;
  const isLocalOnly = isLocal && !isCloud;
  const isCloudOnly = !isLocal && isCloud;
  const isUploaded = isLocal && isCloud;
  const isUpToDate = isUploaded && localDocument.head === cloudDocument.head;
  const isPublished = isCloud && cloudDocument.published;
  const isCollab = isCloud && cloudDocument.collab;
  const isPrivate = isCloud && cloudDocument.private;
  const isAuthor = isCloud ? cloudDocument.author.id === user?.id : true;
  const isCoauthor = isCloud ? cloudDocument.coauthors.some(u => u.id === user?.id) : false;

  const document = isCloudOnly ? cloudDocument : localDocument;
  const handle = cloudDocument?.handle ?? localDocument?.handle ?? document?.id;
  const isEditable = isAuthor || isCoauthor || isCollab;
  const href = document ? `/view/${handle}` : "/";

  const author = cloudDocument?.author ?? user;
  const hydrated = useHydration();

  const subheaderContent = document ? (
    <div style={{ height: "8px" }}></div>
  ) : (
    <Skeleton variant="text" width={150} />
  );

  const localDocumentRevisions = localDocument?.revisions ?? [];
  const cloudDocumentRevisions = cloudDocument?.revisions ?? [];
  const isHeadLocalRevision = localDocumentRevisions.some(r => r.id === localDocument?.head);
  const isHeadCloudRevision = cloudDocumentRevisions.some(r => r.id === localDocument?.head);
  const localOnlyRevisions = isUploaded ? localDocumentRevisions.filter(r => !cloudDocumentRevisions.some(cr => cr.id === r.id)) : [];
  const unsavedChanges = isUploaded && !isHeadLocalRevision && !isHeadCloudRevision;

  let revisionsBadgeContent = 0;

  const avatarContent = (
    <Badge badgeContent={revisionsBadgeContent} color="secondary">
      <Suspense fallback={<ThumbnailSkeleton />}>
        <DocumentThumbnail userDocument={userDocument} />
      </Suspense>
    </Badge>
  );

  const actionsContent = !userDocument ? (
    <>
      <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} label={<Skeleton variant="text" width={50} />} />
      <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} label={<Skeleton variant="text" width={70} />} />
      <IconButton aria-label="Share Document" size="small" disabled><Share /></IconButton>
      <IconButton aria-label='Document Actions' size="small" disabled><MoreVert /></IconButton>
    </>
  ) : (
    <>
      {isLocalOnly && <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} icon={<MobileFriendly />} label="Local" />}
      {isUploaded && <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} icon={isUpToDate ? <CloudDone /> : <CloudSync />} label={isUpToDate ? "Synced" : "Out of Sync"} />}
      {isCloudOnly && (isAuthor || isCoauthor) && <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} icon={<Cloud />} label="Cloud" />}
      {isPublished && <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} icon={<Public />} label="Published" />}
      {isCollab && <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} icon={<Workspaces />} label="Collab" />}
      {isPrivate && <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} icon={<Security />} label="Private" />}
      <Chip 
        sx={{ width: 0, flex: 1, maxWidth: "fit-content", pointerEvents: "auto" }} 
        avatar={
          document ? <Avatar alt={author?.name ?? "Local User"} src={author?.image ?? undefined} />
            : <Skeleton variant="circular" width={24} height={24} />
        }
        label={document ? author?.name ?? "Local User" : <Skeleton variant="text" width={100} />} 
      />
      {userDocument && <DocumentActionMenu userDocument={userDocument} user={user} />}
    </>
  );

  return (
    <BaseCard
      userDocument={userDocument}
      user={user}
      sx={{ 
        borderWidth: 1,
        ...sx 
      }}
      href={href}
      title={document ? document.name : <Skeleton variant="text" width={190} />}
      subheader={subheaderContent}
      avatar={avatarContent}
      actions={actionsContent}
    />
  );
});

export default DocumentCard;
