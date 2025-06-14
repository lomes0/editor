"use client"
import * as React from 'react';
import { memo, Suspense } from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import { Badge, Chip, IconButton, Skeleton, Avatar, Card, CardActionArea, CardHeader, CardActions } from '@mui/material';
import { MobileFriendly, Cloud, CloudDone, CloudSync, Public, Workspaces, Security, Share, MoreVert } from '@mui/icons-material';
import { User, UserDocument } from '@/types';
import DocumentActionMenu from './DocumentActionMenu';
import DocumentThumbnail from './DocumentThumbnail';
import ThumbnailSkeleton from './ThumbnailSkeleton';
import { useHydration } from '@/hooks/useHydration';
import RouterLink from 'next/link';

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
    <Card 
      variant="outlined" 
      className="document-card"
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between", 
        height: "100%", 
        minHeight: "200px", 
        maxWidth: "100%", 
        position: "relative",
        borderRadius: "8px",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderColor: "primary.light",
          transform: "translateY(-2px)"
        },
        borderWidth: 1,
        ...sx 
      }}
    >
      <CardActionArea 
        component={RouterLink} 
        prefetch={false} 
        href={href} 
        sx={{ 
          flexGrow: 1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "transparent" // Remove default hover background
          }
        }}
      />
      <div style={{ position: "relative", zIndex: 2, pointerEvents: "none" }}>
        <CardHeader 
          sx={{ 
            alignItems: "start", 
            px: 2.5,
            pt: 2.5,
            pb: 1.5,
            '& .MuiCardHeader-content': { 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis",
              ml: 0.5
            },
            '& .MuiCardHeader-title': { 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis",
              fontSize: "1.05rem",
              fontWeight: 500,
              letterSpacing: "0.01em",
              color: "text.primary"
            }
          }}
          title={document ? document.name : <Skeleton variant="text" width={190} />}
          subheader={subheaderContent}
          avatar={avatarContent}
        />
      </div>
      <CardActions 
        sx={{ 
          height: 50, 
          minHeight: 50,
          px: 2,
          py: 1,
          backgroundColor: "transparent",
          borderTop: "1px solid",
          borderColor: "divider",
          "& button:first-of-type": { ml: "auto !important" }, 
          '& .MuiChip-root:last-of-type': { mr: 1 },
          position: "relative", 
          zIndex: 2,
          pointerEvents: "auto"
        }}
      >
        {actionsContent}
      </CardActions>
    </Card>
  );
});

export default DocumentCard;
