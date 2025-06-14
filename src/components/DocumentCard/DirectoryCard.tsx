"use client"
import * as React from 'react';
import { memo } from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import { Badge, Chip, IconButton, Skeleton, Avatar } from '@mui/material';
import { MobileFriendly, Cloud, CloudDone, CloudSync, Share, MoreVert, Folder } from '@mui/icons-material';
import { User, UserDocument } from '@/types';
import DocumentActionMenu from './DocumentActionMenu';
import { useHydration } from '@/hooks/useHydration';
import BaseCard from './BaseCard';

const DirectoryCard: React.FC<{ userDocument?: UserDocument, user?: User, sx?: SxProps<Theme> }> = memo(({ userDocument, user, sx }) => {
  const localDocument = userDocument?.local;
  const cloudDocument = userDocument?.cloud;
  const isLocal = !!localDocument;
  const isCloud = !!cloudDocument;
  const isLocalOnly = isLocal && !isCloud;
  const isCloudOnly = !isLocal && isCloud;
  const isUploaded = isLocal && isCloud;
  const isUpToDate = isUploaded && localDocument.head === cloudDocument.head;

  const document = isCloudOnly ? cloudDocument : localDocument;
  const handle = cloudDocument?.handle ?? localDocument?.handle ?? document?.id;
  const href = document ? `/browse/${handle}` : "/";

  const author = cloudDocument?.author ?? user;
  const hydrated = useHydration();
  const backgroundImage = document?.background_image;

  const subheaderContent = document ? (
    <div style={{ height: "8px" }}></div>
  ) : (
    <Skeleton variant="text" width={150} />
  );

  const avatarContent = (
    <Badge badgeContent={0} color="secondary">
      <Avatar sx={{ bgcolor: 'primary.main' }}>
        <Folder />
      </Avatar>
    </Badge>
  );

  const actionsContent = !userDocument ? (
    <>
      <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} label={<Skeleton variant="text" width={50} />} />
      <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} label={<Skeleton variant="text" width={70} />} />
      <IconButton aria-label="Share Directory" size="small" disabled><Share /></IconButton>
      <IconButton aria-label='Directory Actions' size="small" disabled><MoreVert /></IconButton>
    </>
  ) : (
    <>
      {isLocalOnly && <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} icon={<MobileFriendly />} label="Local" />}
      {isUploaded && <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} icon={isUpToDate ? <CloudDone /> : <CloudSync />} label={isUpToDate ? "Synced" : "Out of Sync"} />}
      {isCloudOnly && <Chip sx={{ width: 0, flex: 1, maxWidth: "fit-content" }} icon={<Cloud />} label="Cloud" />}
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
        ...(backgroundImage && {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '& .MuiCardHeader-title': { 
            textShadow: '0px 1px 3px rgba(0,0,0,0.7)',
            color: 'white' 
          }
        }),
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

export default DirectoryCard;
