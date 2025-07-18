"use client";
import * as React from "react";
import { memo } from "react";
import { SxProps, Theme } from "@mui/material/styles";
import { Avatar, Badge, Box, IconButton, Skeleton } from "@mui/material";
import { Folder, MoreVert, Share } from "@mui/icons-material";
import { User, UserDocument } from "@/types";
import DocumentActionMenu from "./DocumentActionMenu";
import CardBase from "./CardBase";
import { renderSkeletonChips, renderStatusChips } from "./CardChips";
import { cardTheme } from "./theme";
import { useDocumentURL } from "../DocumentURLContext";

// Define proper interface for component props
interface DirectoryCardProps {
  /** The document data */
  userDocument?: UserDocument;
  /** The current user */
  user?: User;
  /** Additional styles to apply */
  sx?: SxProps<Theme>;
  /** Card configuration */
  cardConfig?: {
    /** Min height of the card */
    minHeight?: string;
    /** Whether to show the author chip */
    showAuthor?: boolean;
    /** Max number of status chips to display */
    maxStatusChips?: number;
    /** Whether to show the sort order chip */
    showSortOrder?: boolean;
    /** Whether to show permission chips (published, collab, private) */
    showPermissionChips?: boolean;
  };
}

/**
 * Directory card component representing a folder of documents
 */
const DirectoryCard: React.FC<DirectoryCardProps> = memo(({
  userDocument,
  user,
  sx,
  cardConfig = {},
}) => {
  // Apply default configuration with overrides
  const config = {
    minHeight: cardConfig.minHeight || cardTheme.minHeight.directory,
    showAuthor: cardConfig.showAuthor !== false,
    maxStatusChips: cardConfig.maxStatusChips,
    showSortOrder: cardConfig.showSortOrder !== false,
    showPermissionChips: cardConfig.showPermissionChips !== false,
  };

  // Document state calculations
  const localDocument = userDocument?.local;
  const cloudDocument = userDocument?.cloud;
  const isLocal = Boolean(localDocument);
  const isCloud = Boolean(cloudDocument);
  const isLocalOnly = isLocal && !isCloud;
  const isCloudOnly = !isLocal && isCloud;
  const isUploaded = isLocal && isCloud;
  const isUpToDate = isUploaded && localDocument?.head === cloudDocument?.head;

  // Document permissions and status
  const isPublished = isCloud && cloudDocument?.published &&
    config.showPermissionChips;
  const isCollab = isCloud && cloudDocument?.collab &&
    config.showPermissionChips;
  const isPrivate = isCloud && cloudDocument?.private &&
    config.showPermissionChips;
  const isAuthor = isCloud ? cloudDocument?.author?.id === user?.id : true;
  const isCoauthor = isCloud
    ? cloudDocument?.coauthors?.some((u) => u.id === user?.id)
    : false;

  // Get the document to display (prefer local if available)
  const document = isCloudOnly ? cloudDocument : localDocument;

  // Navigation and metadata
  const handle = cloudDocument?.handle ?? localDocument?.handle ?? document?.id;
  const { getDocumentUrl } = useDocumentURL();
  // Get the URL from context if document exists, or fallback to root
  const href = document && userDocument ? getDocumentUrl(userDocument) : "/";
  const author = cloudDocument?.author ?? user;
  const backgroundImage = document?.background_image;

  // Sort order for display
  const sortOrderValue = localDocument?.sort_order ??
    cloudDocument?.sort_order ?? 0;
  const hasSortOrder = sortOrderValue > 0 && config.showSortOrder;

  // Rendering helpers
  const isLoading = !userDocument;

  // Top content with background image or folder icon
  const topContent = (
    <Box
      sx={{
        width: "100%",
        height: "100%", // This ensures the box takes up all available height
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "absolute", // Position absolute to fill the entire container
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        // Remove the fixed minHeight - let it fill the parent container
      }}
    >
      {!backgroundImage && (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Badge badgeContent={0} color="secondary">
            <Avatar
              sx={{
                width: cardTheme.iconSizes.folderAvatar,
                height: cardTheme.iconSizes.folderAvatar,
                bgcolor: "primary.main",
                boxShadow: cardTheme.colors.shadow.default,
              }}
              aria-label="Folder icon"
            >
              <Folder sx={{ fontSize: cardTheme.iconSizes.folderIcon }} />
            </Avatar>
          </Badge>
        </Box>
      )}
    </Box>
  );

  // Chip content based on document status
  const chipContent = isLoading ? renderSkeletonChips() : renderStatusChips({
    isLocalOnly,
    isUploaded,
    isUpToDate,
    isCloudOnly: isCloudOnly && (isAuthor || isCoauthor),
    isPublished,
    isCollab,
    isPrivate,
    hasSortOrder,
    sortOrderValue,
    author,
    showAuthor: config.showAuthor,
    statusChipCount: config.maxStatusChips,
  });

  // Action buttons
  const actionContent = isLoading
    ? (
      <>
        <IconButton
          aria-label="Share Directory"
          size="small"
          disabled
        >
          <Share />
        </IconButton>
        <IconButton
          aria-label="Directory Actions"
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
    );

  // Title content
  const titleContent = document
    ? document.name
    : <Skeleton variant="text" width={190} />;

  return (
    <CardBase
      title={titleContent}
      href={href}
      isLoading={isLoading}
      topContent={topContent}
      chipContent={chipContent}
      actionContent={actionContent}
      minHeight={config.minHeight}
      className="directory-card"
      ariaLabel={document
        ? `Open ${document.name} directory`
        : "Loading directory"}
      sx={sx}
      contentProps={{
        titlePadding: {
          top: cardTheme.spacing.titleMargin,
          bottom: cardTheme.spacing.titleMargin,
        },
        showSubheaderSpace: true,
      }}
    />
  );
});

// Set display name for debugging purposes
DirectoryCard.displayName = "DirectoryCard";

export default DirectoryCard;
