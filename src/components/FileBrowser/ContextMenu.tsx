"use client";
import React, { useState } from 'react';
import { 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  FileCopy as CopyIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { DocumentType, UserDocument } from "@/types";
import { actions, useDispatch, useSelector } from "@/store";
import { v4 as uuid } from 'uuid';
import documentDB, { revisionDB } from '@/indexeddb';

interface ContextMenuProps {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  handleClose: () => void;
  item: {
    id: string;
    name: string;
    type: DocumentType;
  } | null;
  onStartEditing?: (item: { id: string; name: string; type: DocumentType }, event: React.MouseEvent) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  open, 
  anchorPosition, 
  handleClose, 
  item,
  onStartEditing
}) => {
  const dispatch = useDispatch();
  
  // State for rename dialog
  const [newName, setNewName] = useState("");
  const [renameOpen, setRenameOpen] = useState(false);
  
  // Get the full document data from the store
  const documents = useSelector((state) => state.documents);
  
  if (!item) return null;
  
  // Debug item received
  console.log("ContextMenu received item:", item);
  
  // Find the complete document in the store
  const document = documents.find(doc => doc.id === item.id);
  console.log("Found document in store:", document);
  
  // Debug dispatch function
  console.log("Dispatch function:", typeof dispatch, dispatch.length);

  const isDirectory = item.type === DocumentType.DIRECTORY;

  // Handle rename action
  const handleRenameClick = (event: React.MouseEvent) => {
    if (onStartEditing && item) {
      // Initialize newName with the current item name
      setNewName(item.name);
      // Use the in-place editing
      onStartEditing(item, event);
    }
    handleClose();
  };

  const handleRenameSubmit = async () => {
    if (newName.trim() && newName !== item.name) {
      console.log("Renaming document/folder:", item.id, "to:", newName.trim());
      console.log("Full document data:", document);
      
      // Close dialog immediately to prevent double-clicks
      setRenameOpen(false);
      
      try {
        // Try both approaches - Redux action and direct DB access
        
        // 1. Redux approach with enhanced logging
        console.log("Attempting to rename document with ID:", item.id);
        const renamePromise = dispatch(
          actions.updateLocalDocument({
            id: item.id,
            partial: {
              name: newName.trim()
            }
          })
        );
        console.log("Rename action dispatched, promise:", renamePromise);
        
        // 2. Direct IndexedDB approach as fallback
        console.log("Also trying direct IndexedDB update");
        try {
          // Get the original document
          const originalDoc = await documentDB.getByID(item.id);
          if (originalDoc) {
            console.log("Found original document:", originalDoc);
            
            // Update the name
            const updatedDoc = {
              ...originalDoc,
              name: newName.trim(),
              updatedAt: new Date().toISOString(),
            };
            
            // Save the updated document
            await documentDB.update(updatedDoc);
            console.log("Document renamed in IndexedDB:", updatedDoc);
          } else {
            console.error("Original document not found in IndexedDB");
          }
        } catch (dbError) {
          console.error("Direct IndexedDB update failed:", dbError);
        }
        
        // Show confirmation notification
        dispatch(
          actions.announce({
            message: {
              title: `Renamed successfully`,
              subtitle: `"${item.name}" renamed to "${newName.trim()}"`,
            },
          })
        );
        
        // Reload the current page to refresh the file list
        window.location.reload();
        
      } catch (e) {
        console.error("Exception when trying to rename:", e);
        dispatch(
          actions.announce({
            message: {
              title: `Failed to rename`,
              subtitle: `Error occurred when trying to rename "${item.name}"`,
            },
          })
        );
      }
    } else {
      setRenameOpen(false);
    }
  };

  // Handle delete action - now matches DeleteBoth component's approach
  const handleDeleteAction = async () => {
    console.log("Directly deleting document/folder:", item.id);
    console.log("Full document data:", document);
    
    // Close menu immediately 
    handleClose();
    
    // Check if document exists in cloud or local
    const isLocal = document?.local !== undefined;
    const isCloud = document?.cloud !== undefined;
    
    try {
      // Delete from cloud first (if exists)
      if (isCloud) {
        console.log("Attempting to delete cloud document with ID:", item.id);
        await dispatch(actions.deleteCloudDocument(item.id));
      }
      
      // Then delete from local (if exists)
      if (isLocal) {
        console.log("Attempting to delete local document with ID:", item.id);
        await dispatch(actions.deleteLocalDocument(item.id));
      }
      
      // As a fallback, try direct IndexedDB deletion
      if (isLocal) {
        try {
          await documentDB.deleteByID(item.id);
          console.log("Direct IndexedDB deletion successful");
          await revisionDB.deleteManyByKey("documentId", item.id);
          console.log("Related revisions deleted");
        } catch (dbError) {
          console.error("Direct IndexedDB deletion failed:", dbError);
        }
      }
      
      // Show confirmation notification
      dispatch(
        actions.announce({
          message: {
            title: `${isDirectory ? 'Folder' : 'Document'} deleted`,
            subtitle: `"${item.name}" has been deleted`,
          },
        })
      );
      
      // Return to the parent if this was successful
      if (document?.local?.parentId) {
        window.location.href = `/browse/${document.local.parentId}`;
      } else {
        // Reload the current page to refresh the file list
        window.location.reload();
      }
      
    } catch (e) {
      console.error("Exception when trying to delete:", e);
      dispatch(
        actions.announce({
          message: {
            title: `Failed to delete`,
            subtitle: `Error occurred when trying to delete "${item.name}"`,
          },
        })
      );
    }
  };

  // Handle duplicate action
  const handleDuplicate = async () => {
    const duplicateId = uuid();
    console.log("Duplicating document/folder:", item.id, "with new ID:", duplicateId);
    console.log("Full document data:", document);
    
    // Close menu immediately to prevent double-clicks
    handleClose();
    
    try {
      // Try both approaches - Redux action and direct DB access
      
      // 1. Redux approach with enhanced logging
      console.log("Attempting to duplicate document with ID:", item.id);
      const duplicatePromise = dispatch(
        actions.duplicateDocument({
          id: item.id,
          newId: duplicateId,
          newName: `${item.name} (Copy)`
        })
      );
      console.log("Duplicate action dispatched, promise:", duplicatePromise);
      
      // 2. Direct IndexedDB approach as fallback
      console.log("Also trying direct IndexedDB duplication");
      try {
        // Get the original document
        const originalDoc = await documentDB.getByID(item.id);
        if (originalDoc) {
          console.log("Found original document:", originalDoc);
          
          // Create a copy with the new ID and name
          const duplicatedDoc = {
            ...originalDoc,
            id: duplicateId,
            name: `${item.name} (Copy)`,
            head: uuid(), // Generate a new head revision ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Save the duplicated document
          await documentDB.add(duplicatedDoc);
          console.log("Duplicated document saved:", duplicatedDoc);
          
          // Duplicate the current head revision
          const headRevision = await revisionDB.getByID(originalDoc.head);
          if (headRevision) {
            const duplicatedRevision = {
              ...headRevision,
              id: duplicatedDoc.head,
              documentId: duplicateId,
              createdAt: new Date().toISOString(),
            };
            await revisionDB.add(duplicatedRevision);
            console.log("Duplicated revision saved:", duplicatedRevision);
          }
        } else {
          console.error("Original document not found in IndexedDB");
        }
      } catch (dbError) {
        console.error("Direct IndexedDB duplication failed:", dbError);
      }
      
      // Show confirmation notification
      dispatch(
        actions.announce({
          message: {
            title: `${isDirectory ? 'Folder' : 'Document'} duplicated`,
            subtitle: `Created a copy of "${item.name}"`,
          },
        })
      );
      
      // Reload the current page to refresh the file list
      window.location.reload();
      
    } catch (e) {
      console.error("Exception when trying to duplicate:", e);
      dispatch(
        actions.announce({
          message: {
            title: `Failed to duplicate`,
            subtitle: `Error occurred when trying to duplicate "${item.name}"`,
          },
        })
      );
    }
  };

  return (
    <>
      <Menu
        open={open}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition || undefined}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { 
              minWidth: 200,
              borderRadius: 1,
              mt: 0.5
            }
          }
        }}
      >
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDeleteAction}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>
            Delete
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ContextMenu;
