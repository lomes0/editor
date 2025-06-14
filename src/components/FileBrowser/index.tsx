"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "@/store";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Article,
  ChevronRight,
  ExpandMore,
  Folder,
  FolderOpen,
  Home as HomeIcon,
} from "@mui/icons-material";
import { DocumentType, UserDocument } from "@/types";

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
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(
    null,
  );

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

  const handleRootClick = () => {
    router.push("/browse");
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
            selected={isCurrentDirectory || isCurrentDocument}
            sx={{
              pl: level * 1.5 + 1,
              py: 0.5,
              minHeight: 36,
              "&.Mui-selected": {
                bgcolor: "action.selected",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 30,
                color: (isCurrentDirectory || isCurrentDocument)
                  ? "primary.main"
                  : "inherit",
              }}
            >
              {isDirectory
                ? (
                  isExpanded
                    ? <FolderOpen fontSize="small" />
                    : <Folder fontSize="small" />
                )
                : <Article fontSize="small" />}
            </ListItemIcon>

            {open && (
              <>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontSize: 14,
                    fontWeight: (isCurrentDirectory ||
                        isCurrentDocument)
                      ? "medium"
                      : "normal",
                    color: (isCurrentDirectory ||
                        isCurrentDocument)
                      ? "primary.main"
                      : "text.primary",
                  }}
                />

                {isDirectory && (
                  <Box>
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
        {/* Root node */}
        <ListItemButton
          onClick={handleRootClick}
          selected={currentDirectory === null &&
            pathname === "/browse"}
          sx={{
            py: 0.5,
            minHeight: 36,
            "&.Mui-selected": {
              bgcolor: "action.selected",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 30,
              color: currentDirectory === null &&
                  pathname === "/browse"
                ? "primary.main"
                : "inherit",
            }}
          >
            <HomeIcon fontSize="small" />
          </ListItemIcon>

          {open && (
            <ListItemText
              primary="Root"
              primaryTypographyProps={{
                noWrap: true,
                fontSize: 14,
                fontWeight: currentDirectory === null &&
                    pathname === "/browse"
                  ? "medium"
                  : "normal",
                color: currentDirectory === null &&
                    pathname === "/browse"
                  ? "primary.main"
                  : "text.primary",
              }}
            />
          )}
        </ListItemButton>

        {/* Directory tree */}
        {treeData.length > 0
          ? (
            renderTreeItems(treeData)
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
    </>
  );
};

export default FileBrowser;
