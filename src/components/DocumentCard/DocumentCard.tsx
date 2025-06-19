"use client";
import * as React from "react";
import { memo, Suspense } from "react";
import { SxProps, Theme } from "@mui/material/styles";
import { Badge, IconButton, Skeleton } from "@mui/material";
import { MoreVert, Share } from "@mui/icons-material";
import { User, UserDocument } from "@/types";
import DocumentActionMenu from "./DocumentActionMenu";
import DocumentThumbnail from "./DocumentThumbnail";
import ThumbnailSkeleton from "./ThumbnailSkeleton";
import CardBase from "./CardBase";
import { renderSkeletonChips, renderStatusChips } from "./CardChips";
import { cardTheme } from "./theme";

// Define proper interface for component props
interface DocumentCardProps {
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
 * Document card component representing a document in the system
 */
const DocumentCard: React.FC<DocumentCardProps> = memo(({
  userDocument,
  user,
  sx,
  cardConfig = {},
}) => {
  // Apply default configuration with overrides
  const config = {
    minHeight: cardConfig.minHeight || cardTheme.minHeight.document,
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
  const href = document ? `/view/${handle}` : "/";
  const author = cloudDocument?.author ?? user;

  // Sort order for display
  const sortOrderValue = localDocument?.sort_order ??
    cloudDocument?.sort_order ?? 0;
  const hasSortOrder = sortOrderValue > 0 && config.showSortOrder;

  // Determine the badge content (if any)
  const revisionsBadgeContent = 0; // This appears to be unused currently

  // Rendering helpers
  const isLoading = !userDocument;

  // Top content with document thumbnail
  const topContent = (
    <Badge badgeContent={revisionsBadgeContent} color="secondary">
      <Suspense fallback={<ThumbnailSkeleton />}>
        <DocumentThumbnail userDocument={userDocument} />
      </Suspense>
    </Badge>
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
      className="document-card"
      ariaLabel={document
        ? `Open ${document.name} document`
        : "Loading document"}
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
DocumentCard.displayName = "DocumentCard";

export default DocumentCard;
