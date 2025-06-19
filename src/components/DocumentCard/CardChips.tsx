import React from "react";
import { Avatar, Chip, Skeleton, SxProps, Theme } from "@mui/material";
import {
  Cloud,
  CloudDone,
  CloudSync,
  MobileFriendly,
  Public,
  Security,
  Workspaces,
} from "@mui/icons-material";
import { User } from "@/types";
import { cardTheme } from "./theme";

/**
 * Props for a single status chip
 */
interface ChipProps {
  /** Icon to display in the chip */
  icon?: React.ReactElement;
  /** Text to display in the chip */
  label: string | number | React.ReactElement;
  /** Avatar to display in the chip */
  avatar?: React.ReactElement;
  /** Additional styles to apply to the chip */
  sx?: SxProps<Theme>;
  /** Whether the chip should capture pointer events */
  pointerEvents?: boolean;
  /** Color of the chip border */
  borderColor?: string;
  /** Background color of the chip */
  bgColor?: string;
  /** Text color of the chip */
  textColor?: string;
  /** Font weight of the chip label */
  fontWeight?: string | number;
  /** Size of the chip */
  size?: "small" | "medium";
  /** Variant of the chip */
  variant?: "filled" | "outlined";
  /** Click handler for the chip */
  onClick?: () => void;
}

interface StatusChipProps {
  /** State flags */
  isLocalOnly?: boolean;
  isUploaded?: boolean;
  isUpToDate?: boolean;
  isCloudOnly?: boolean;
  isPublished?: boolean;
  isCollab?: boolean;
  isPrivate?: boolean;
  hasSortOrder?: boolean;
  sortOrderValue?: number;
  
  /** Author information */
  author?: User | null;
  showAuthor?: boolean;
  
  /** Chip customization */
  chipSize?: "small" | "medium";
  chipVariant?: "filled" | "outlined";
  sortChipStyles?: Partial<ChipProps>;
  defaultChipStyles?: Partial<ChipProps>;
  statusChipCount?: number; // Limit the number of status chips to show
}

/**
 * Create a styled chip with consistent appearance
 */
export const createChip = ({
  icon,
  label,
  avatar,
  sx = {},
  pointerEvents = false,
  borderColor,
  bgColor,
  textColor,
  fontWeight,
  size = "small",
  variant = "outlined",
  onClick
}: ChipProps) => (
  <Chip
    size={size}
    variant={variant}
    icon={icon}
    avatar={avatar}
    label={label}
    onClick={onClick}
    sx={{
      ...(pointerEvents && { pointerEvents: "auto" }),
      ...(borderColor && { borderColor }),
      ...(bgColor && { bgcolor: bgColor }),
      ...(textColor && { color: textColor }),
      ...(fontWeight && { fontWeight }),
      ...sx
    }}
  />
);

/**
 * Generate status chips based on document/directory properties
 */
export const renderStatusChips = ({
  isLocalOnly = false,
  isUploaded = false,
  isUpToDate = false,
  isCloudOnly = false,
  isPublished = false,
  isCollab = false,
  isPrivate = false,
  hasSortOrder = false,
  sortOrderValue = 0,
  author = null,
  showAuthor = true,
  chipSize = "small",
  chipVariant = "outlined",
  sortChipStyles = {},
  defaultChipStyles = {},
  statusChipCount
}: StatusChipProps) => {
  // Array to hold all status chips
  const statusChips = [];
  
  // Add status chips based on state
  if (isLocalOnly) {
    statusChips.push(
      createChip({
        icon: <MobileFriendly />,
        label: "Local",
        size: chipSize,
        variant: chipVariant,
        ...defaultChipStyles
      })
    );
  }
  
  if (isUploaded) {
    statusChips.push(
      createChip({
        icon: isUpToDate ? <CloudDone /> : <CloudSync />,
        label: isUpToDate ? "Synced" : "Out of Sync",
        size: chipSize,
        variant: chipVariant,
        ...defaultChipStyles
      })
    );
  }
  
  if (isCloudOnly) {
    statusChips.push(
      createChip({
        icon: <Cloud />,
        label: "Cloud",
        size: chipSize,
        variant: chipVariant,
        ...defaultChipStyles
      })
    );
  }
  
  if (isPublished) {
    statusChips.push(
      createChip({
        icon: <Public />,
        label: "Published",
        size: chipSize,
        variant: chipVariant,
        ...defaultChipStyles
      })
    );
  }
  
  if (isCollab) {
    statusChips.push(
      createChip({
        icon: <Workspaces />,
        label: "Collab",
        size: chipSize,
        variant: chipVariant,
        ...defaultChipStyles
      })
    );
  }
  
  if (isPrivate) {
    statusChips.push(
      createChip({
        icon: <Security />,
        label: "Private",
        size: chipSize,
        variant: chipVariant,
        ...defaultChipStyles
      })
    );
  }
  
  // Limit the number of status chips if specified
  const displayedStatusChips = statusChipCount 
    ? statusChips.slice(0, statusChipCount) 
    : statusChips;
  
  return (
    <>
      {displayedStatusChips.map((chip, index) => (
        <React.Fragment key={`status-chip-${index}`}>
          {chip}
        </React.Fragment>
      ))}
      
      {/* Author chip */}
      {showAuthor && author && (
        <Chip
          size={chipSize}
          variant={chipVariant}
          sx={{ pointerEvents: "auto", ...defaultChipStyles.sx }}
          avatar={
            <Avatar
              alt={author.name ?? "Local User"}
              src={author.image ?? undefined}
            />
          }
          label={author.name ?? "Local User"}
        />
      )}
      
      {/* Sort order chip */}
      {hasSortOrder && (
        createChip({
          label: `Sort: ${sortOrderValue}`,
          size: chipSize,
          variant: chipVariant,
          bgColor: cardTheme.colors.sortChipBg,
          borderColor: "gray",
          textColor: "gray",
          fontWeight: "bold",
          ...sortChipStyles
        })
      )}
    </>
  );
};

/**
 * Render loading skeleton chips for cards in loading state
 */
export const renderSkeletonChips = (count = 2, sizes = [50, 70], chipProps = {}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Chip
          key={`skeleton-chip-${index}`}
          size="small"
          variant="outlined"
          label={<Skeleton variant="text" width={sizes[index % sizes.length]} />}
          {...chipProps}
        />
      ))}
    </>
  );
};
