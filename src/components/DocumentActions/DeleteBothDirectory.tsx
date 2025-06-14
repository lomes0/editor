"use client"
import { useDispatch, actions } from "@/store";
import { UserDocument } from "@/types";
import { Delete, DeleteForever } from "@mui/icons-material";
import { IconButton, ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { v4 as uuid } from "uuid";

/**
 * Component to delete both local and cloud versions of a directory at once
 */
const DeleteBothDirectory: React.FC<{ 
  userDocument: UserDocument, 
  variant?: 'menuitem' | 'iconbutton', 
  closeMenu?: () => void 
}> = ({ userDocument, variant = 'iconbutton', closeMenu }) => {
  const dispatch = useDispatch();
  const localDocument = userDocument.local;
  const cloudDocument = userDocument.cloud;
  const isLocal = !!localDocument;
  const isCloud = !!cloudDocument;
  const id = userDocument.id;
  const name = localDocument?.name || cloudDocument?.name || "This Folder";

  const handleDelete = async () => {
    if (closeMenu) closeMenu();
    const alert = {
      title: `Delete Folder`,
      content: `Are you sure you want to delete folder "${name}"? This will remove it from both cloud and local storage.`,
      actions: [
        { label: "Cancel", id: uuid() },
        { label: "Delete", id: uuid() },
      ]
    };
    const response = await dispatch(actions.alert(alert));
    if (response.payload === alert.actions[1].id) {
      // Delete from cloud first (if exists)
      if (isCloud) {
        await dispatch(actions.deleteCloudDocument(id));
      }
      
      // Then delete from local (if exists)
      if (isLocal) {
        await dispatch(actions.deleteLocalDocument(id));
      }
    }
  };

  if (variant === 'menuitem') return (
    <MenuItem onClick={handleDelete}>
      <ListItemIcon>
        <DeleteForever />
      </ListItemIcon>
      <ListItemText>Delete Folder</ListItemText>
    </MenuItem>
  );
  return <IconButton aria-label="Delete Folder" onClick={handleDelete} size="small"><DeleteForever /></IconButton>
}

export default DeleteBothDirectory;
