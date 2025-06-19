"use client";
import React, { useState, useContext } from "react";
import { Box, Fade, Paper, Tooltip } from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { actions, useDispatch } from "@/store";
import { v4 as uuid } from "uuid";
import { DragContext } from "../DragContext";
import { UserDocument } from "@/types";

const TrashBin: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isDropTarget, setIsDropTarget] = useState(false);
  const { isDragging } = useContext(DragContext);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDropTarget(true);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDropTarget(false);

    try {
      const data = e.dataTransfer.getData("application/matheditor-document");
      if (!data) return;

      const draggedItem = JSON.parse(data);
      
      // Show confirmation dialog before deleting
      const alert = {
        title: `Delete ${draggedItem.type === 'DIRECTORY' ? 'Directory' : 'Document'}`,
        content: `Are you sure you want to delete "${draggedItem.name}"?`,
        actions: [
          { label: "Cancel", id: uuid() },
          { label: "Delete", id: uuid() }
        ]
      };
      
      const response = await dispatch(actions.alert(alert));
      
      if (response.payload === alert.actions[1].id) {
        // Get the document to delete
        const docResponse = await dispatch(actions.getDocumentById(draggedItem.id));
        const document = docResponse.payload as UserDocument;
        
        if (!document) return;
        
        // Delete local and/or cloud document
        if (document.local) {
          await dispatch(actions.deleteLocalDocument(draggedItem.id));
        }
        
        if (document.cloud) {
          await dispatch(actions.deleteCloudDocument(draggedItem.id));
        }
        
        // Show success message
        dispatch(actions.announce({
          message: {
            title: `Deleted ${draggedItem.name}`,
          },
          timeout: 3000,
        }));
      }
    } catch (error) {
      console.error("Error during deletion:", error);
      dispatch(actions.announce({
        message: {
          title: "Failed to delete item",
          subtitle: "An error occurred while deleting the item",
        },
        timeout: 3000,
      }));
    }
  };

  return (
    <Fade in={isDragging} timeout={300}>
      <Box
        sx={{
          position: "fixed",
          bottom: 40,
          right: 40,
          zIndex: 1000,
          pointerEvents: isDragging ? "auto" : "none",
        }}
      >
        <Tooltip title="Drop here to delete" arrow placement="top">
          <Paper
            elevation={3}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              backgroundColor: isDropTarget
                ? theme.palette.error.main
                : theme.palette.background.paper,
              border: `2px solid ${isDropTarget ? theme.palette.error.dark : theme.palette.grey[300]}`,
              transition: theme.transitions.create(["background-color", "transform", "border"], {
                duration: 200,
              }),
              transform: isDropTarget ? "scale(1.1)" : "scale(1)",
              cursor: "default",
            }}
          >
            <DeleteForever
              sx={{
                fontSize: 40,
                color: isDropTarget ? theme.palette.common.white : theme.palette.error.main,
                transition: theme.transitions.create("color", {
                  duration: 200,
                }),
              }}
            />
          </Paper>
        </Tooltip>
      </Box>
    </Fade>
  );
};

export default TrashBin;
