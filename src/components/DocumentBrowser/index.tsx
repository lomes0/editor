"use client";
import { useDispatch, useSelector } from "@/store";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Fade,
  Paper,
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
  PostAdd,
} from "@mui/icons-material";
import DraggableDocumentCard from "../DocumentCard/DraggableDocumentCard";
import { DocumentType, UserDocument } from "@/types";
import DocumentSortControl from "../DocumentControls/SortControl";
import { sortDocuments } from "../DocumentControls/sortDocuments";
import { useRouter } from "next/navigation";

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
        return localParentId === directoryId ||
          cloudParentId === directoryId;
      });

      setChildItems(children);
    } else {
      // Get root level documents (items without a parentId)
      const rootItems = documents.filter((doc) => {
        const localParentId = doc.local?.parentId;
        const cloudParentId = doc.cloud?.parentId;
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
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <Typography>Loading directory contents...</Typography>
        </Box>
      </Container>
    );
  }

  // Render error state if specified directory not found
  if (directoryId && !currentDirectory) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
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
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
      <Fade in={true} timeout={600}>
        <Box
          className="document-browser-container"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            width: "100%",
            maxWidth: "100%",
            px: { xs: 1, sm: 2, md: 3 }, // Add padding that increases with screen size
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
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: "medium",
                  color: "text.primary",
                }}
              >
                {pageTitle}
              </Typography>
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
                }}
              >
                {/* Display directories section */}
                {sortedDirectories.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                        pl: 1,
                      }}
                    >
                      <Folder color="primary" />
                      <Typography
                        variant="h6"
                        fontWeight="medium"
                      >
                        Folders
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                      {sortedDirectories.map(
                        (directory) => (
                          <Grid
                            key={directory.id}
                            size={{
                              xs: 12,
                              sm: 6,
                              md: 4,
                              lg: 3
                            }}
                          >
                            <DraggableDocumentCard
                              userDocument={directory}
                              user={user}
                              currentDirectoryId={directoryId}
                            />
                          </Grid>
                        ),
                      )}
                    </Grid>
                  </Box>
                )}

                {/* Display documents section */}
                {sortedDocuments.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {sortedDirectories.length > 0 && <Divider sx={{ my: 1 }} />}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                        pl: 1,
                      }}
                    >
                      <Article color="primary" />
                      <Typography
                        variant="h6"
                        fontWeight="medium"
                      >
                        Documents
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                      {sortedDocuments.map((document) => (
                        <Grid
                          key={document.id}
                          size={{
                            xs: 12,
                            sm: 6,
                            md: 4,
                            lg: 3
                          }}
                        >
                          <DraggableDocumentCard
                            userDocument={document}
                            user={user}
                            currentDirectoryId={directoryId}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
        </Box>
      </Fade>
    </Container>
  );
};

export default DocumentBrowser;
