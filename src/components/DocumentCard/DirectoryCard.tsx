"use client";
import * as React from "react";
import { memo } from "react";
import { SxProps, Theme } from "@mui/material/styles";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import {
  Cloud,
  CloudDone,
  CloudSync,
  Folder,
  MobileFriendly,
  MoreVert,
  Share,
} from "@mui/icons-material";
import { User, UserDocument } from "@/types";
import DocumentActionMenu from "./DocumentActionMenu";
import { useHydration } from "@/hooks/useHydration";
import Link from "next/link";

const DirectoryCard: React.FC<
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

  // Check if directory has a valid sort_order (> 0) to display the sort order chip
  const sortOrderValue = localDocument?.sort_order ??
    cloudDocument?.sort_order ?? 0;
  const hasSortOrder = sortOrderValue > 0;

  const document = isCloudOnly ? cloudDocument : localDocument;
  const handle = cloudDocument?.handle ?? localDocument?.handle ??
    document?.id;
  const href = document ? `/browse/${handle}` : "/";

  const author = cloudDocument?.author ?? user;
  const hydrated = useHydration();
  const backgroundImage = document?.background_image;

  // Status chips for the directory
  const statusChip = () => {
    if (!userDocument) {
      return <Skeleton variant="rounded" width={60} height={24} />;
    }
    if (isLocalOnly) {
      return (
        <Chip
          size="small"
          variant="outlined"
          icon={<MobileFriendly />}
          label="Local"
        />
      );
    }
    if (isUploaded) {
      return (
        <Chip
          size="small"
          variant="outlined"
          icon={isUpToDate ? <CloudDone /> : <CloudSync />}
          label={isUpToDate ? "Synced" : "Out of Sync"}
        />
      );
    }
    if (isCloudOnly) {
      return (
        <Chip
          size="small"
          variant="outlined"
          icon={<Cloud />}
          label="Cloud"
        />
      );
    }
    return null;
  };

  // Author chip
  const authorChip = () => {
    if (!document) {
      return <Skeleton variant="rounded" width={100} height={24} />;
    }
    return (
      <Chip
        size="small"
        variant="outlined"
        avatar={
          <Avatar
            alt={author?.name ?? "Local User"}
            src={author?.image ?? undefined}
          />
        }
        label={author?.name ?? "Local User"}
      />
    );
  };

  return (
    <Card
      variant="outlined"
      className="directory-card"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight: "240px", // Reduced from 280px to make cards smaller
        width: "100%", // Allow card to fill available width
        position: "relative",
        borderRadius: "12px",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          transform: "translateY(-4px)",
        },
        borderWidth: 1,
        ...sx,
      }}
    >
      {/* Top section (60%): Background Image */}
      <Box
        sx={{
          height: "60%", // Reduced from 65% to give more space to bottom section
          minHeight: "144px", // Adjusted for smaller card (60% of 240px)
          width: "100%", // Ensure backgrounds fill the full width
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper", // Changed from grey.100 to match DocumentCard
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {!backgroundImage && (
          <Badge badgeContent={0} color="secondary">
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <Folder sx={{ fontSize: 48 }} />
            </Avatar>
          </Badge>
        )}
      </Box>

      {/* Add clickable area that covers everything except action buttons */}
      <CardActionArea
        component={Link}
        href={href}
        prefetch={false}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: "60px", // Updated to match the new height of the bottom section
          zIndex: 1,
          borderRadius: "12px 12px 0 0",
          "&:hover": {
            backgroundColor: "transparent", // Remove default hover effect
          },
        }}
      />

      {/* Bottom section (40%): Directory Info & Actions */}
      <Box
        sx={{
          height: "40%", // Increased from 35% to give more space to bottom section
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 2, // Higher than the action area
        }}
      >
        <CardContent sx={{ pt: 1, pb: 0, flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              mb: 0.1,
              mt: 0.1, // Add top margin to push the title down
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "1rem", // Reduced from 1.1rem for smaller cards
            }}
          >
            {document ? document.name : <Skeleton variant="text" width={190} />}
          </Typography>
          {/* Added a small space similar to DocumentCard's subheaderContent */}
          {document
            ? <div style={{ height: "8px" }}></div>
            : <Skeleton variant="text" width={150} />}
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
            zIndex: 3, // Higher than the card content and action area
            height: "60px", // Increased from 50px to give more room for chips
            mt: "auto",
            "& button:first-of-type": { ml: "auto !important" }, // Added to match DocumentCard
            "& .MuiChip-root:last-of-type": { mr: 1 }, // Added to match DocumentCard
            pointerEvents: "auto", // Added to match DocumentCard
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              flexWrap: "nowrap",
              overflow: "hidden",
              py: 0.0, // Add vertical padding to lift chips away from bottom
            }}
          >
            {/* Update to small chips to match DocumentCard */}
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
                  {isCloudOnly && (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<Cloud />}
                      label="Cloud"
                    />
                  )}
                  <Chip
                    size="small"
                    variant="outlined"
                    sx={{ pointerEvents: "auto" }}
                    avatar={
                      <Avatar
                        alt={author?.name ?? "Local User"}
                        src={author?.image ?? undefined}
                      />
                    }
                    label={author?.name ?? "Local User"}
                  />
                  {/* Sort order indicator */}
                  {hasSortOrder && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Sort: ${sortOrderValue}`}
                      sx={{
                        bgcolor: "rgba(0,0,0,0.05)",
                        borderColor: "gray",
                        color: "gray",
                        fontWeight: "bold",
                      }}
                    />
                  )}
                </>
              )}
          </Box>

          <Box sx={{ display: "flex", ml: "auto" }}>
            {userDocument
              ? (
                <DocumentActionMenu
                  userDocument={userDocument}
                  user={user}
                />
              )
              : (
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
              )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
});

export default DirectoryCard;
