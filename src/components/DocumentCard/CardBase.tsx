"use client";
import * as React from "react";
import { ReactNode } from "react";
import { SxProps, Theme } from "@mui/material/styles";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { cardTheme } from "./theme";

interface CardBaseProps {
  /** Title of the card - can be a string or React node (like a Skeleton) */
  title: string | ReactNode;

  /** URL that the card links to */
  href: string;

  /** Whether the card is in a loading state */
  isLoading?: boolean;

  /** Content to display in the top section of the card */
  topContent: ReactNode;

  /** Content to display in the chip area (bottom left) */
  chipContent: ReactNode;

  /** Content to display in the actions area (bottom right) */
  actionContent: ReactNode;

  /** Height of the card - defaults to 260px if not specified */
  minHeight?: string;

  /** Additional styles to apply to the card */
  sx?: SxProps<Theme>;

  /** CSS class name for the card */
  className?: string;

  /** Accessible label for the card */
  ariaLabel?: string;

  /** Additional props for the card content area */
  contentProps?: {
    /** Padding for the title area */
    titlePadding?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    /** Whether to display a space below the title */
    showSubheaderSpace?: boolean;
    /** Height of the space below the title */
    subheaderSpaceHeight?: string;
  };

  /** Additional props for the action bar */
  actionBarProps?: {
    /** Height of the action bar */
    height?: string;
    /** Padding for the action bar */
    padding?: {
      x?: number;
      y?: number;
    };
  };
}

/**
 * Shared base component for both DocumentCard and DirectoryCard
 * to ensure consistent styling and behavior
 */
const CardBase: React.FC<CardBaseProps> = ({
  title,
  href,
  isLoading = false,
  topContent,
  chipContent,
  actionContent,
  minHeight = cardTheme.minHeight.document,
  sx = {},
  className = "card-base",
  ariaLabel = "Open item",
  contentProps = {},
  actionBarProps = {},
}) => {
  // Default values for content area
  const {
      titlePadding = {
        top: cardTheme.spacing.titleMargin,
        bottom: cardTheme.spacing.titleMargin,
        left: undefined,
        right: undefined,
      },
      showSubheaderSpace = true,
      subheaderSpaceHeight = "8px",
    } = contentProps,
    // Default values for action bar
    {
      height = cardTheme.actionBar.height,
      padding = {
        x: cardTheme.spacing.contentPadding,
        y: 1,
      },
    } = actionBarProps,
    // Calculate the height of the top section based on the contentRatio
    topSectionHeight = cardTheme.contentRatio.top,
    bottomSectionHeight = cardTheme.contentRatio.bottom,
    // Calculate the min-height of the top section based on the card's minHeight
    topSectionMinHeight = `calc(${minHeight} * ${
      parseFloat(topSectionHeight) / 100
    })`;

  return (
    <Card
      variant="outlined"
      className={className}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight,
        width: "100%",
        position: "relative",
        borderRadius: `${cardTheme.borderRadius}px`,
        borderColor: cardTheme.colors.border,
        transition: cardTheme.animation.transition,
        boxShadow: cardTheme.colors.shadow.default,
        "&:hover": {
          boxShadow: cardTheme.colors.shadow.hover,
          transform: cardTheme.animation.hoverTransform,
        },
        borderWidth: 1,
        ...sx,
      }}
    >
      {/* Top section */}
      <Box
        sx={{
          height: topSectionHeight,
          minHeight: topSectionMinHeight,
          width: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: cardTheme.colors.border,
        }}
      >
        {topContent}
      </Box>

      {/* Clickable area */}
      <CardActionArea
        component={Link}
        href={href}
        prefetch={false}
        aria-label={ariaLabel}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: height,
          zIndex: 1,
          borderRadius:
            `${cardTheme.borderRadius}px ${cardTheme.borderRadius}px 0 0`,
          "&:hover": {
            backgroundColor: "transparent",
          },
        }}
      />

      {/* Bottom section */}
      <Box
        sx={{
          height: bottomSectionHeight,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 2,
        }}
      >
        <CardContent
          sx={{
            pt: titlePadding.top,
            pb: titlePadding.bottom,
            pl: titlePadding.left,
            pr: titlePadding.right,
            flexGrow: 1,
            display: "flex",
            alignItems: "center", // Vertically center all content
            position: "relative",
            padding: "0 16px", // Reset padding for better control
            overflow: "hidden", // Prevent overflow issues
          }}
        >
          <Box
            sx={{
              width: "100%",
              textAlign: "left", // Keep text left-aligned within the centered box
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: cardTheme.typography.titleWeight,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: cardTheme.typography.titleSize,
                mb: showSubheaderSpace ? 1 : 0,
              }}
            >
              {title}
            </Typography>
            {showSubheaderSpace &&
              (isLoading
                ? <Skeleton variant="text" width={150} />
                : <Box sx={{ height: subheaderSpaceHeight }} />)}
          </Box>
        </CardContent>

        <Box
          sx={{
            px: padding.x,
            py: padding.y,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid",
            borderColor: cardTheme.colors.border,
            backgroundColor: "transparent",
            zIndex: 3,
            height,
            mt: "auto",
            "& button:first-of-type": { ml: "auto !important" },
            "& .MuiChip-root:last-of-type": { mr: 1 },
            pointerEvents: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: cardTheme.spacing.chipGap,
              flexWrap: "nowrap",
              overflow: "hidden",
            }}
          >
            {chipContent}
          </Box>

          <Box sx={{ display: "flex", ml: "auto" }}>
            {actionContent}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CardBase;
