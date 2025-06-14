"use client";
import React, { useRef, useState } from "react";
import { DocumentType, User, UserDocument } from "@/types";
import { Box, SxProps } from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import DocumentCard from "./index";
import { actions, useDispatch, useSelector } from "@/store";

interface DraggableDocumentCardProps {
  userDocument: UserDocument;
  user?: User;
  sx?: SxProps<Theme> | undefined;
  currentDirectoryId?: string;
}

const DraggableDocumentCard: React.FC<DraggableDocumentCardProps> = ({
  userDocument,
  user,
  sx,
  currentDirectoryId,
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const documents = useSelector((state) => state.documents);

  const document = userDocument?.local || userDocument?.cloud;
  const isDirectory = document?.type === DocumentType.DIRECTORY;

  // Prevent dragging the current directory into itself
  const isCurrentDirectory = currentDirectoryId === userDocument.id;
  // Only directories can be drop targets
  const canBeDropTarget = isDirectory && !isCurrentDirectory;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Set the drag data (document id and type)
    e.dataTransfer.setData(
      "application/matheditor-document",
      JSON.stringify({
        id: userDocument.id,
        name: document?.name,
        type: document?.type,
      }),
    );

    // Create a custom drag image if needed
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        cardRef.current,
        rect.width / 2,
        rect.height / 2,
      );
    }

    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Only allow dropping into directories
    if (canBeDropTarget) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setIsDropTarget(true);
    }
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDropTarget(false);

    // Only process drops if this is a directory
    if (!canBeDropTarget) return;

    try {
      const data = e.dataTransfer.getData(
        "application/matheditor-document",
      );
      if (!data) return;

      const draggedItem = JSON.parse(data);

      // Don't allow dropping a directory into itself or dropping the current directory
      if (
        draggedItem.id === userDocument.id ||
        draggedItem.id === currentDirectoryId
      ) {
        return;
      }

      // Find the dragged document in the store using getDocumentById
      const draggedDocResponse = await dispatch(
        actions.getDocumentById(draggedItem.id),
      );
      const draggedDoc = draggedDocResponse.payload as UserDocument;

      if (!draggedDoc) return;

      // Update the document's parentId to the current directory's id
      if (draggedDoc.local) {
        await dispatch(actions.updateLocalDocument({
          id: draggedItem.id,
          partial: {
            parentId: userDocument.id,
          },
        }));
      }

      if (draggedDoc.cloud) {
        await dispatch(actions.updateCloudDocument({
          id: draggedItem.id,
          partial: {
            parentId: userDocument.id,
          },
        }));
      }

      // Show a success message
      dispatch(actions.announce({
        message: {
          title: `Moved ${draggedItem.name} to ${document?.name}`,
        },
        timeout: 3000,
      }));
    } catch (error) {
      console.error("Error during drop:", error);
      dispatch(actions.announce({
        message: {
          title: "Failed to move item",
          subtitle: "An error occurred while moving the item",
        },
        timeout: 3000,
      }));
    }
  };

  return (
    <Box
      ref={cardRef}
      draggable={!isCurrentDirectory}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        cursor: isCurrentDirectory ? "default" : "grab",
        transition: theme.transitions.create([
          "transform",
          "box-shadow",
          "border",
        ]),
        transform: isDragging ? "scale(0.95)" : "scale(1)",
        opacity: isDragging ? 0.7 : 1,
        position: "relative",
        "&::before": canBeDropTarget
          ? {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            borderRadius: theme.shape.borderRadius,
            border: isDropTarget
              ? `2px solid ${theme.palette.primary.main}`
              : "none",
            backgroundColor: isDropTarget
              ? `${theme.palette.primary.main}20` // 20% opacity
              : "transparent",
            pointerEvents: "none",
          }
          : {},
      }}
    >
      <DocumentCard
        userDocument={userDocument}
        user={user}
        sx={{
          ...sx,
          // Add consistent hover effect for all cards
          "&:hover": {
            boxShadow: 3,
          },
          // Add visual indicator only for drop targets
          ...(canBeDropTarget && {
            "&:hover": isDropTarget
              ? {
                borderStyle: "solid",
                borderColor: theme.palette.primary.main,
                backgroundColor: `${theme.palette.primary.main}20`, // 20% opacity for active drop targets
              }
              : {
                boxShadow: 3,
              },
          }),
        }}
      />
    </Box>
  );
};

export default DraggableDocumentCard;
