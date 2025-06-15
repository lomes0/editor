"use client";
import * as React from "react";
import { memo, Suspense } from "react";
import { SxProps, Theme } from "@mui/material/styles";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import {
  Cloud,
  CloudDone,
  CloudSync,
  MobileFriendly,
  MoreVert,
  Public,
  Security,
  Share,
  Workspaces,
} from "@mui/icons-material";
import { User, UserDocument } from "@/types";
import DocumentActionMenu from "./DocumentActionMenu";
import DocumentThumbnail from "./DocumentThumbnail";
import ThumbnailSkeleton from "./ThumbnailSkeleton";
import { useHydration } from "@/hooks/useHydration";
import RouterLink from "next/link";

const DocumentCard: React.FC<
  { userDocument?: UserDocument; user?: User; sx?: SxProps<Theme> }
> = memo(({ userDocument, user, sx }) => {
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
  const isCoauthor = isCloud
    ? cloudDocument.coauthors.some((u) => u.id === user?.id)
    : false;
  
  // Check if document has a valid sort_order (> 0) to display the sort order chip
  const sortOrderValue = localDocument?.sort_order ?? cloudDocument?.sort_order ?? 0;
  const hasSortOrder = sortOrderValue > 0;

  const document = isCloudOnly ? cloudDocument : localDocument;
  const handle = cloudDocument?.handle ?? localDocument?.handle ??
    document?.id;
  const isEditable = isAuthor || isCoauthor || isCollab;
  const href = document ? `/view/${handle}` : "/";

  const author = cloudDocument?.author ?? user;
  const hydrated = useHydration();

  const subheaderContent = document
    ? <div style={{ height: "8px" }}></div>
    : <Skeleton variant="text" width={150} />;

  const localDocumentRevisions = localDocument?.revisions ?? [];
  const cloudDocumentRevisions = cloudDocument?.revisions ?? [];
  const isHeadLocalRevision = localDocumentRevisions.some((r) =>
    r.id === localDocument?.head
  );
  const isHeadCloudRevision = cloudDocumentRevisions.some((r) =>
    r.id === localDocument?.head
  );
  const localOnlyRevisions = isUploaded
    ? localDocumentRevisions.filter((r) =>
      !cloudDocumentRevisions.some((cr) => cr.id === r.id)
    )
    : [];
  const unsavedChanges = isUploaded && !isHeadLocalRevision &&
    !isHeadCloudRevision;

  let revisionsBadgeContent = 0;

  const avatarContent = (
    <Badge badgeContent={revisionsBadgeContent} color="secondary">
      <Suspense fallback={<ThumbnailSkeleton />}>
        <DocumentThumbnail userDocument={userDocument} />
      </Suspense>
    </Badge>
  );

  const actionsContent = !userDocument
    ? (
      <>
        <Chip
          sx={{ width: 0, flex: 1, maxWidth: "fit-content" }}
          label={<Skeleton variant="text" width={50} />}
        />
        <Chip
          sx={{ width: 0, flex: 1, maxWidth: "fit-content" }}
          label={<Skeleton variant="text" width={70} />}
        />
        <IconButton aria-label="Share Document" size="small" disabled>
          <Share />
        </IconButton>
        <IconButton aria-label="Document Actions" size="small" disabled>
          <MoreVert />
        </IconButton>
      </>
    )
    : (
      <>
        {isLocalOnly && (
          <Chip
            sx={{ width: 0, flex: 1, maxWidth: "fit-content" }}
            icon={<MobileFriendly />}
            label="Local"
          />
        )}
        {isUploaded && (
          <Chip
            sx={{ width: 0, flex: 1, maxWidth: "fit-content" }}
            icon={isUpToDate ? <CloudDone /> : <CloudSync />}
            label={isUpToDate ? "Synced" : "Out of Sync"}
          />
        )}
        {isCloudOnly && (isAuthor || isCoauthor) && (
          <Chip
            sx={{ width: 0, flex: 1, maxWidth: "fit-content" }}
            icon={<Cloud />}
            label="Cloud"
          />
        )}
        {isPublished && (
          <Chip
            sx={{ width: 0, flex: 1, maxWidth: "fit-content" }}
            icon={<Public />}
            label="Published"
          />
        )}
        {isCollab && (
          <Chip
            sx={{ width: 0, flex: 1, maxWidth: "fit-content" }}
            icon={<Workspaces />}
            label="Collab"
          />
        )}
        {isPrivate && (
          <Chip
            sx={{ width: 0, flex: 1, maxWidth: "fit-content" }}
            icon={<Security />}
            label="Private"
          />
        )}
        <Chip
          sx={{
            width: 0,
            flex: 1,
            maxWidth: "fit-content",
            pointerEvents: "auto",
          }}
          avatar={document
            ? (
              <Avatar
                alt={author?.name ?? "Local User"}
                src={author?.image ?? undefined}
              />
            )
            : (
              <Skeleton
                variant="circular"
                width={24}
                height={24}
              />
            )}
          label={document
            ? author?.name ?? "Local User"
            : <Skeleton variant="text" width={100} />}
        />
        {userDocument && (
          <DocumentActionMenu
            userDocument={userDocument}
            user={user}
          />
        )}
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
        minHeight: "320px", // Maintain the same minHeight as before
        maxWidth: "100%",
        position: "relative",
        borderRadius: "12px",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          borderColor: "primary.light",
          transform: "translateY(-4px)",
        },
        borderWidth: 1,
        ...sx,
      }}
    >
      {/* Top section (65%): Document Thumbnail */}
      <Box
        sx={{
          height: "65%", // Adjusted to match DirectoryCard's ratio
          minHeight: "208px", // Adjusted for card (65% of 320px)
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Badge badgeContent={revisionsBadgeContent} color="secondary">
          <Suspense fallback={<ThumbnailSkeleton />}>
            <DocumentThumbnail userDocument={userDocument} />
          </Suspense>
        </Badge>
      </Box>

      {/* Clickable area for the entire card except the action buttons */}
      <CardActionArea
        component={RouterLink}
        prefetch={false}
        href={href}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: "50px",
          zIndex: 1,
          borderRadius: "12px 12px 0 0",
          "&:hover": {
            backgroundColor: "transparent", // Remove default hover background
          },
        }}
      />

      {/* Bottom section (35%): Document Info & Actions */}
      <Box
        sx={{
          height: "35%", // Adjusted to match DirectoryCard's ratio
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 2,
        }}
      >
        <CardContent sx={{ pt: 1.5, pb: 0.5, flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "1.1rem", // Adjusted to match DirectoryCard
            }}
          >
            {document ? document.name : <Skeleton variant="text" width={190} />}
          </Typography>
          {subheaderContent}
        </CardContent>

        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "transparent",
            zIndex: 3,
            height: "50px",
            mt: "auto",
            "& button:first-of-type": { ml: "auto !important" },
            "& .MuiChip-root:last-of-type": { mr: 1 },
            pointerEvents: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              flexWrap: "nowrap",
              overflow: "hidden",
            }}
          >
            {!userDocument
              ? (
                <>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={
                      <Skeleton
                        variant="text"
                        width={50}
                      />
                    }
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={
                      <Skeleton
                        variant="text"
                        width={70}
                      />
                    }
                  />
                </>
              )
              : (
                <>
                  {isLocalOnly && (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<MobileFriendly />}
                      label="Local"
                    />
                  )}
                  {isUploaded && (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={isUpToDate ? <CloudDone /> : <CloudSync />}
                      label={isUpToDate ? "Synced" : "Out of Sync"}
                    />
                  )}
                  {isCloudOnly && (isAuthor || isCoauthor) &&
                    (
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<Cloud />}
                        label="Cloud"
                      />
                    )}
                  {isPublished && (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<Public />}
                      label="Published"
                    />
                  )}
                  {isCollab && (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<Workspaces />}
                      label="Collab"
                    />
                  )}
                  {isPrivate && (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<Security />}
                      label="Private"
                    />
                  )}
                  <Chip
                    size="small"
                    variant="outlined"
                    sx={{ pointerEvents: "auto" }}
                    avatar={document
                      ? (
                        <Avatar
                          alt={author?.name ??
                            "Local User"}
                          src={author?.image ??
                            undefined}
                        />
                      )
                      : (
                        <Skeleton
                          variant="circular"
                          width={24}
                          height={24}
                        />
                      )}
                    label={document ? author?.name ?? "Local User" : (
                      <Skeleton
                        variant="text"
                        width={100}
                      />
                    )}
                  />
                  {/* Sort order indicator */}
                  {hasSortOrder && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Sort: ${sortOrderValue}`}
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.05)',
                        borderColor: 'gray',
                        color: 'gray',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                </>
              )}
          </Box>

          <Box sx={{ display: "flex", ml: "auto" }}>
            {!userDocument
              ? (
                <>
                  <IconButton
                    aria-label="Share Document"
                    size="small"
                    disabled
                  >
                    <Share />
                  </IconButton>
                  <IconButton
                    aria-label="Document Actions"
                    size="small"
                    disabled
                  >
                    <MoreVert />
                  </IconButton>
                </>
              )
              : (
                <DocumentActionMenu
                  userDocument={userDocument}
                  user={user}
                />
              )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
});

export default DocumentCard;
