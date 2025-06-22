"use client";
import { useDispatch, useSelector } from "@/store";
import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  Divider,
  Fade,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Link from "next/link";
import {
  ArrowBack,
  Article,
  CreateNewFolder,
  FilterList,
  Folder,
  FolderOpen,
  PostAdd,
  Storage,
} from "@mui/icons-material";
import DraggableDocumentCard from "../DocumentCard/DraggableDocumentCard";
import { DocumentType, UserDocument } from "@/types";
import DocumentSortControl from "../DocumentControls/SortControl";
import { sortDocuments } from "../DocumentControls/sortDocuments";
import { useRouter } from "next/navigation";
import DocumentGrid from "../DocumentGrid";
import { DragProvider } from "../DragContext";
import TrashBin from "../TrashBin";

interface DocumentBrowserProps {
  directoryId?: string;
}

const DocumentBrowser: React.FC<DocumentBrowserProps> = ({ directoryId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const documents = useSelector((state) => state.documents);
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(directoryId ? true : false);
  const [currentDirectory, setCurrentDirectory] = useState<
    UserDocument | null
  >(null);
  const [childItems, setChildItems] = useState<UserDocument[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string; name: string }[]
  >([]);
  const [sortValue, setSortValue] = useState({
    key: "updatedAt",
    direction: "desc",
  });

  // Load directory and its contents if directoryId is provided
  useEffect(() => {
    if (!directoryId) return;

    const loadDirectory = async () => {
      setLoading(true);

      // Find the current directory
      const directory = documents.find((doc) =>
        (doc.local?.id === directoryId ||
          doc.cloud?.id === directoryId) &&
        ((doc.local?.type === DocumentType.DIRECTORY) ||
          (doc.cloud?.type === DocumentType.DIRECTORY))
      );

      if (directory) {
        setCurrentDirectory(directory);

        // Build breadcrumb trail
        const buildBreadcrumbs = (
          docId: string,
          trail: { id: string; name: string }[] = [],
        ) => {
          const doc = documents.find((d) =>
            d.local?.id === docId || d.cloud?.id === docId
          );
          if (!doc) return trail;

          const name = doc.local?.name || doc.cloud?.name || "";
          const parentId = doc.local?.parentId || doc.cloud?.parentId;

          const newTrail = [{ id: docId, name }, ...trail];

          if (parentId) {
            return buildBreadcrumbs(parentId, newTrail);
          }

          return newTrail;
        };

        setBreadcrumbs(buildBreadcrumbs(directoryId));
      }

      setLoading(false);
    };

    loadDirectory();
  }, [directoryId, documents]);

  // Get items to display - either from a specific directory or root items
  useEffect(() => {
    if (directoryId) {
      // Find child documents and directories
      const children = documents.filter((doc) => {
        const localParentId = doc.local?.parentId;
        const cloudParentId = doc.cloud?.parentId;

        console.log(`Child doc check ${doc.id}:`, {
          docId: doc.id,
          localParent: localParentId,
          cloudParent: cloudParentId,
          directoryId,
          isChild: localParentId === directoryId ||
            cloudParentId === directoryId,
        });

        // For cloud documents with undefined parentId, they can't be children of any directory
        if (doc.cloud && cloudParentId === undefined) {
          return false;
        }

        return localParentId === directoryId ||
          cloudParentId === directoryId;
      });

      setChildItems(children);
    } else {
      // Get root level documents (items without a parentId)
      const rootItems = documents.filter((doc) => {
        const localParentId = doc.local?.parentId;
        const cloudParentId = doc.cloud?.parentId;

        // Special handling for cloud documents:
        // If it's a cloud document but parentId is undefined (not null),
        // we need to treat it differently since the field might be missing in the API response
        if (doc.cloud && cloudParentId === undefined) {
          // Consider it a root document if parentId is undefined (not explicitly set to a value)
          // This is a workaround for cloud documents that don't have parentId in the API response
          return true;
        }

        return !localParentId && !cloudParentId;
      });

      setChildItems(rootItems);
    }
  }, [directoryId, documents]);

  // Function to determine if a document is a directory
  const isDirectory = (doc: UserDocument) =>
    (doc.local?.type === DocumentType.DIRECTORY) ||
    (doc.cloud?.type === DocumentType.DIRECTORY);

  // Process and categorize items
  const processedIds = new Set<string>();
  const directories: UserDocument[] = [];
  const regularDocuments: UserDocument[] = [];

  childItems.forEach((doc) => {
    if (processedIds.has(doc.id)) return;
    processedIds.add(doc.id);

    if (isDirectory(doc)) {
      directories.push(doc);
    } else {
      regularDocuments.push(doc);
    }
  });

  // Apply sorting
  const sortedDirectories = sortDocuments(
    directories,
    sortValue.key,
    sortValue.direction,
  );
  const sortedDocuments = sortDocuments(
    regularDocuments,
    sortValue.key,
    sortValue.direction,
  );

  // Handle creating a new document
  const handleCreateDocument = () => {
    if (directoryId) {
      router.push(`/new?parentId=${directoryId}`);
    } else {
      router.push("/new");
    }
  };

  // Handle creating a new directory
  const handleCreateDirectory = () => {
    if (directoryId) {
      router.push(`/new-directory/${directoryId}`);
    } else {
      router.push("/new-directory");
    }
  };

  // Render loading state for directory browsing
  if (loading) {
    return (
      <Container
        maxWidth={false}
        sx={{
          py: 4,
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          maxWidth: { xs: "100%", sm: "100%", md: "2000px", lg: "2200px" },
          mx: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 2,
              pb: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Skeleton variant="text" width={200} height={40} />
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: { xs: "wrap", sm: "nowrap" },
                width: { xs: "100%", md: "auto" },
              }}
            >
              <Skeleton variant="rounded" width={140} height={40} />
              <Skeleton variant="rounded" width={140} height={40} />
              <Skeleton variant="rounded" width={180} height={40} />
            </Box>
          </Box>

          <DocumentGrid
            items={[]}
            title="Folders"
            titleIcon={<FolderOpen />}
            isLoading={true}
            skeletonCount={3}
          />

          <DocumentGrid
            items={[]}
            title="Documents"
            titleIcon={<Article />}
            isLoading={true}
            skeletonCount={6}
          />
        </Box>
      </Container>
    );
  }

  // Render error state if specified directory not found
  if (directoryId && !currentDirectory) {
    return (
      <Container
        maxWidth={false}
        sx={{
          py: 4,
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          maxWidth: { xs: "100%", sm: "100%", md: "2000px", lg: "2200px" },
          mx: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 4,
            gap: 2,
          }}
        >
          <Folder
            sx={{
              width: 64,
              height: 64,
              color: "text.secondary",
              opacity: 0.6,
            }}
          />
          <Typography variant="h6">Directory not found</Typography>
          <Button
            component={Link}
            href="/browse"
            startIcon={<ArrowBack />}
            variant="contained"
            sx={{ borderRadius: 1.5, mt: 2 }}
          >
            Back to Document Browser
          </Button>
        </Box>
      </Container>
    );
  }

  // Get page title - either directory name or "Home"
  const pageTitle = directoryId
    ? (currentDirectory?.local?.name || currentDirectory?.cloud?.name ||
      "Directory")
    : "Root";

  return (
    <DragProvider>
      <Container
        maxWidth={false}
        sx={{
          py: 4,
          px: { xs: 2, sm: 3, md: 4, lg: 1 },
          maxWidth: { xs: "100%", sm: "100%", md: "2000px", lg: "2200px" },
          mx: "auto",
        }}
      >
        <Fade in={true} timeout={600}>
          <Box
            className="document-browser-container"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              width: "100%",
              maxWidth: "100%",
              px: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
              }, /* Increased padding for larger screens */
            }}
          >
            {/* Page title and controls */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: { xs: "wrap", md: "nowrap" },
                gap: 2,
                pb: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Breadcrumbs aria-label="breadcrumb">
                  <Link
                    href="/browse"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: directoryId ? "inherit" : "text.primary",
                      textDecoration: "none",
                      fontWeight: directoryId ? "normal" : "medium",
                    }}
                  >
                    <Storage sx={{ mr: 0.5 }} fontSize="inherit" />
                    Root
                  </Link>

                  {directoryId && breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    if (isLast) {
                      return (
                        <Typography
                          key={crumb.id}
                          color="text.primary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            fontWeight: "medium",
                          }}
                        >
                          <Folder
                            sx={{ mr: 0.5 }}
                            fontSize="inherit"
                          />
                          {crumb.name}
                        </Typography>
                      );
                    }

                    return (
                      <Link
                        key={crumb.id}
                        href={`/browse/${crumb.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <Folder sx={{ mr: 0.5 }} fontSize="inherit" />
                        {crumb.name}
                      </Link>
                    );
                  })}
                </Breadcrumbs>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                  width: { xs: "100%", md: "auto" },
                  justifyContent: {
                    xs: "center",
                    md: "flex-end",
                  },
                }}
              >
                <Tooltip title="Create a new document">
                  <Button
                    variant="outlined"
                    startIcon={<PostAdd />}
                    onClick={handleCreateDocument}
                    sx={{
                      borderRadius: 1.5,
                      px: 2,
                    }}
                  >
                    New Document
                  </Button>
                </Tooltip>

                <Tooltip title="Create a new folder">
                  <Button
                    variant="outlined"
                    startIcon={<CreateNewFolder />}
                    onClick={handleCreateDirectory}
                    sx={{
                      borderRadius: 1.5,
                      px: 2,
                    }}
                  >
                    New Folder
                  </Button>
                </Tooltip>

                <Tooltip title="Sort your documents">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "background.paper",
                      borderRadius: 1.5,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center",
                        px: 1.5,
                        height: "100%",
                        borderRight: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <FilterList
                        fontSize="small"
                        sx={{
                          mr: 0.5,
                          color: "text.secondary",
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Sort
                      </Typography>
                    </Box>
                    <DocumentSortControl
                      value={sortValue}
                      setValue={setSortValue}
                    />
                  </Box>
                </Tooltip>
              </Box>
            </Box>

            {/* Content section */}
            {childItems.length === 0
              ? (
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 6,
                    gap: 2,
                    borderRadius: 2,
                    border: "1px dashed",
                    borderColor: "divider",
                    bgcolor: "background.default",
                  }}
                >
                  {directoryId
                    ? (
                      <Folder
                        sx={{
                          width: 64,
                          height: 64,
                          color: "text.secondary",
                          opacity: 0.6,
                        }}
                      />
                    )
                    : (
                      <PostAdd
                        sx={{
                          width: 64,
                          height: 64,
                          color: "text.secondary",
                          opacity: 0.6,
                        }}
                      />
                    )}
                  <Typography variant="h6">
                    {directoryId ? "This folder is empty" : "No content found"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    Create a new document or folder to get started
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<PostAdd />}
                      onClick={handleCreateDocument}
                      sx={{ borderRadius: 1.5, mr: 2 }}
                    >
                      New Document
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CreateNewFolder />}
                      onClick={handleCreateDirectory}
                      sx={{ borderRadius: 1.5 }}
                    >
                      New Folder
                    </Button>
                  </Box>
                </Paper>
              )
              : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    opacity: 1,
                    transition: "opacity 0.5s ease-in-out",
                  }}
                >
                  {/* Display directories section */}
                  <DocumentGrid
                    items={sortedDirectories}
                    user={user}
                    currentDirectoryId={directoryId}
                    title="Folders"
                    titleIcon={<FolderOpen />}
                  />

                  {/* Display documents section */}
                  {sortedDirectories.length > 0 && sortedDocuments.length > 0 &&
                    <Divider sx={{ my: 2 }} />}
                  <DocumentGrid
                    items={sortedDocuments}
                    user={user}
                    currentDirectoryId={directoryId}
                    title="Documents"
                    titleIcon={<Article />}
                  />
                </Box>
              )}
          </Box>
        </Fade>
      </Container>
      <TrashBin />
    </DragProvider>
  );
};

export default DocumentBrowser;
