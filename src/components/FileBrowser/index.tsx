"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { actions, useDispatch, useSelector } from "@/store";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Article,
  ChevronRight,
  ExpandMore,
  Folder,
  FolderOpen,
} from "@mui/icons-material";
import { DocumentType, UserDocument } from "@/types";
import ContextMenu from "./ContextMenu";
import documentDB, { revisionDB } from '@/indexeddb';

interface FileBrowserProps {
  open: boolean; // Whether sidebar is expanded
}

interface TreeItem {
  id: string;
  name: string;
  type: DocumentType;
  children: TreeItem[];
  parentId: string | null;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ open }) => {
  const documents = useSelector((state) => state.documents);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(
    null,
  );
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    item: TreeItem | null;
  } | null>(null);
  
  // In-place editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  // Extract directory ID from pathname
  useEffect(() => {
    if (pathname.startsWith("/browse/")) {
      const dirId = pathname.replace("/browse/", "");
      setCurrentDirectory(dirId);

      // Auto-expand parents of current directory
      if (dirId) {
        const expandParents = (id: string) => {
          const doc = documents.find(
            (d) => (d.local?.id === id || d.cloud?.id === id),
          );

          if (doc) {
            const parentId = doc.local?.parentId ||
              doc.cloud?.parentId;
            if (parentId) {
              setExpandedNodes((prev) => {
                const newSet = new Set(prev);
                newSet.add(parentId);
                return newSet;
              });
              expandParents(parentId);
            }
          }
        };

        expandParents(dirId);
      }
    } else if (
      pathname.startsWith("/view/") || pathname.startsWith("/edit/")
    ) {
      // For view and edit routes, highlight the current document and expand its parent directories
      const docId = pathname.replace(/^\/(view|edit)\//, "");

      if (docId) {
        // Find the document and its parent
        const doc = documents.find((d) => d.id === docId);
        if (doc) {
          const parentId = doc.local?.parentId || doc.cloud?.parentId;
          if (parentId) {
            setCurrentDirectory(parentId);

            // Auto-expand parent directories
            const expandParents = (id: string) => {
              setExpandedNodes((prev) => {
                const newSet = new Set(prev);
                newSet.add(id);
                return newSet;
              });

              const parent = documents.find((d) => d.id === id);
              if (parent) {
                const grandParentId = parent.local?.parentId ||
                  parent.cloud?.parentId;
                if (grandParentId) {
                  expandParents(grandParentId);
                }
              }
            };

            expandParents(parentId);
          } else {
            setCurrentDirectory(null); // Root directory
          }
        }
      }
    } else {
      setCurrentDirectory(null);
    }
  }, [pathname, documents]);

  // Build tree data structure from flat documents list
  useEffect(() => {
    // Function to determine if a document is a directory
    const isDirectory = (doc: UserDocument) =>
      (doc.local?.type === DocumentType.DIRECTORY) ||
      (doc.cloud?.type === DocumentType.DIRECTORY);

    // Create tree structure
    const buildTree = () => {
      const items: TreeItem[] = [];
      const map = new Map<string, TreeItem>();

      // First pass: create all tree items without children
      documents.forEach((doc) => {
        const name = doc.local?.name || doc.cloud?.name || "Untitled";
        const type = isDirectory(doc)
          ? DocumentType.DIRECTORY
          : DocumentType.DOCUMENT;
        const parentId = doc.local?.parentId || doc.cloud?.parentId ||
          null;

        const item: TreeItem = {
          id: doc.id,
          name,
          type,
          children: [],
          parentId,
        };

        map.set(doc.id, item);
      });

      // Second pass: build hierarchy
      map.forEach((item) => {
        if (item.parentId) {
          const parent = map.get(item.parentId);
          if (parent) {
            parent.children.push(item);
          } else {
            // Parent not found, add to root level
            items.push(item);
          }
        } else {
          // Root level item
          items.push(item);
        }
      });

      // Sort items: directories first, then by name
      const sortItems = (items: TreeItem[]) => {
        items.sort((a, b) => {
          // Directories first
          if (
            a.type === DocumentType.DIRECTORY &&
            b.type !== DocumentType.DIRECTORY
          ) return -1;
          if (
            a.type !== DocumentType.DIRECTORY &&
            b.type === DocumentType.DIRECTORY
          ) return 1;

          // Then by name alphabetically
          return a.name.localeCompare(b.name);
        });

        // Sort children recursively
        items.forEach((item) => {
          if (item.children.length) {
            sortItems(item.children);
          }
        });

        return items;
      };

      return sortItems(items);
    };

    setTreeData(buildTree());
  }, [documents]);

  const handleItemClick = (item: TreeItem) => {
    if (item.type === DocumentType.DIRECTORY) {
      // Toggle expansion state
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });

      // Navigate to directory
      router.push(`/browse/${item.id}`);
    } else {
      // Navigate to document view
      router.push(`/view/${item.id}`);
    }
  };
  
  // Context menu handlers
  const handleContextMenu = (event: React.MouseEvent, item: TreeItem) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log("Opening context menu for item:", item);
    
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      item: item
    });
  };
  
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  
  // Handle starting in-place editing for an item
  const startEditing = (item: { id: string; name: string; type: DocumentType }, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingItemId(item.id);
    setEditingText(item.name);
    handleCloseContextMenu();
  };
  
  // Handle the edit input change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  };
  
  // Handle canceling the edit
  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingText("");
  };
  
  // Track if we've already submitted the edit to prevent double submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Handle submitting the edit
  const submitEditing = async () => {
    // Prevent double submission
    if (isSubmitting) return;
    
    if (editingItemId && editingText.trim() !== "") {
      // Check if the name has actually changed
      const editingItem = treeData.flat(Infinity).find((item: any) => item.id === editingItemId);
      const originalName = editingItem?.name || "";
      
      // If name hasn't changed, just cancel editing without reload
      if (editingText.trim() === originalName) {
        cancelEditing();
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        // Find the item being edited
        const itemToEdit = documents.find(doc => doc.id === editingItemId);
        if (!itemToEdit) {
          setIsSubmitting(false);
          cancelEditing();
          return;
        }
        
        console.log("Renaming document/folder:", editingItemId, "to:", editingText.trim());
        
        // 1. Redux approach
        console.log("Attempting to rename document with ID:", editingItemId);
        await dispatch(
          actions.updateLocalDocument({
            id: editingItemId,
            partial: {
              name: editingText.trim()
            }
          })
        );
        
        // 2. Direct IndexedDB approach as fallback
        try {
          const originalDoc = await documentDB.getByID(editingItemId);
          if (originalDoc) {
            const updatedDoc = {
              ...originalDoc,
              name: editingText.trim(),
              updatedAt: new Date().toISOString(),
            };
            
            await documentDB.update(updatedDoc);
            console.log("Document renamed in IndexedDB:", updatedDoc);
          }
        } catch (dbError) {
          console.error("Direct IndexedDB update failed:", dbError);
        }
        
        // Show confirmation notification
        dispatch(
          actions.announce({
            message: {
              title: `Renamed successfully`,
              subtitle: `Item renamed to "${editingText.trim()}"`,
            },
          })
        );
        
        // Cancel the editing state before reload
        cancelEditing();
        
        // Use setTimeout to ensure state updates happen before reload
        setTimeout(() => {
          // Reload the current page to refresh the file list
          window.location.reload();
        }, 50);
      } catch (error) {
        console.error("Failed to rename:", error);
        dispatch(
          actions.announce({
            message: {
              title: `Failed to rename`,
              subtitle: `Error occurred when trying to rename item`,
            },
          })
        );
        setIsSubmitting(false);
        cancelEditing();
      }
    } else {
      cancelEditing();
    }
  };

  // Recursive component to render tree items
  const renderTreeItems = (items: TreeItem[], level: number = 0) => {
    return items.map((item) => {
      const isExpanded = expandedNodes.has(item.id);
      const isDirectory = item.type === DocumentType.DIRECTORY;
      const isCurrentDirectory = item.id === currentDirectory;

      // Check if this is the current document (when in view/edit mode)
      const isCurrentDocument = !isDirectory &&
        (pathname === `/view/${item.id}` ||
          pathname === `/edit/${item.id}`);

      return (
        <Box key={item.id}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            onDoubleClick={(e) => {
              // Don't navigate on double click
              e.stopPropagation();
              // Start editing on double click
              startEditing({
                id: item.id,
                name: item.name,
                type: item.type
              }, e);
            }}
            onContextMenu={(e) => handleContextMenu(e, item)}
            selected={isCurrentDirectory || isCurrentDocument}
            sx={{
              pl: level * 1.5 + 2.5, // Adjusted indentation formula - starts with pl: 2.5 at level 0, then adds 1.5 per level
              py: 0.5,
              minHeight: 36,
              "&.Mui-selected": {
                bgcolor: "action.selected",
              },
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.15) !important", // Much darker gray hover color with !important
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 30,
                color: "text.secondary", // Use gray color for icons
                ml: 0, // Ensure no margin is applied
              }}
            >
              {isDirectory
                ? <Folder fontSize="small" />
                : <Article fontSize="small" />}
            </ListItemIcon>

            {open && (
              <>
                {editingItemId === item.id ? (
                  <TextField
                    value={editingText}
                    onChange={handleEditChange}
                    autoFocus
                    size="small"
                    variant="standard"
                    margin="dense"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        submitEditing();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelEditing();
                      }
                    }}
                    // Use onBlur with a small delay to prevent conflicts with button clicks
                    onBlur={(e) => {
                      // Small timeout to allow clicking other elements
                      setTimeout(() => {
                        if (editingItemId === item.id) {
                          submitEditing();
                        }
                      }, 100);
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: 14,
                        py: 0.5,
                      },
                      width: '90%',
                      mr: 1,
                    }}
                    InputProps={{
                      disableUnderline: false,
                    }}
                  />
                ) : (
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      noWrap: true,
                      fontSize: 14,
                      fontWeight: (isCurrentDirectory ||
                          isCurrentDocument)
                        ? "medium"
                        : "normal",
                      color: "text.primary", // Keep default text color for all items
                    }}
                  />
                )}

                {isDirectory && (
                  <Box sx={{ color: "text.secondary" }}>
                    {isExpanded
                      ? <ExpandMore fontSize="small" />
                      : <ChevronRight fontSize="small" />}
                  </Box>
                )}
              </>
            )}
          </ListItemButton>

          {/* Render children if directory is expanded */}
          {isDirectory && isExpanded && (
            <Collapse in={true} timeout="auto" unmountOnExit>
              {renderTreeItems(item.children, level + 1)}
            </Collapse>
          )}
        </Box>
      );
    });
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", px: 2, pt: 1 }}>
        {open && (
          <Typography variant="caption" color="text.secondary">
            Files
          </Typography>
        )}
      </Box>

      <List
        dense
        disablePadding
        sx={{ overflow: "auto", maxHeight: "40vh" }}
      >
        {/* Directory tree */}
        {treeData.length > 0
          ? (
            renderTreeItems(treeData, 0) // Start with level 0 because the base indentation is now included in the formula
          )
          : (
            <Box sx={{ p: 1, textAlign: "center" }}>
              {open && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  No folders found
                </Typography>
              )}
            </Box>
          )}
      </List>
      
      {/* Context Menu */}
      <ContextMenu
        open={Boolean(contextMenu)}
        anchorPosition={
          contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : null
        }
        handleClose={handleCloseContextMenu}
        item={contextMenu?.item ? {
          id: contextMenu.item.id,
          name: contextMenu.item.name,
          type: contextMenu.item.type
        } : null}
        onStartEditing={startEditing}
      />
    </>
  );
};

export default FileBrowser;
