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
        height: "100%",
        minHeight: "280px", // Increased from 240px
        maxWidth: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          transform: "translateY(-4px)",
        },
        ...sx,
      }}
    >
      {/* Top section (70%): Background Image */}
      <Box
        sx={{
          height: "70%", // Changed from 50% to 70%
          minHeight: "196px", // Adjusted for 70% of 280px
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
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
                width: 96,
                height: 96,
                bgcolor: "primary.main",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <Folder sx={{ fontSize: 56 }} />
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
          bottom: "50px", // Updated to match new action bar height
          zIndex: 1,
          borderRadius: "12px 12px 0 0",
          "&:hover": {
            backgroundColor: "transparent", // Remove default hover effect
          },
        }}
      />

      {/* Bottom section (30%): Directory Info & Actions */}
      <Box
        sx={{
          height: "30%", // Changed from 50% to 30%
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 2, // Higher than the action area
        }}
      >
        <CardContent sx={{ pt: 2, pb: 1, flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "1.25rem", // Increased font size
            }}
          >
            {document ? document.name : <Skeleton variant="text" width={190} />}
          </Typography>
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
            height: "50px", // Reduced from 60px to make it narrower
            mt: "auto",
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
            {statusChip()}
            {authorChip()}
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
