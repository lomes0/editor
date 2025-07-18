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
  LibraryBooks,
  PostAdd,
  Settings,
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
import { DocumentURLProvider } from "../DocumentURLContext";

interface DocumentBrowserProps {
  directoryId?: string;
  domainId?: string;
  domainInfo?: any; // Domain information with user details
}

const DocumentBrowser: React.FC<DocumentBrowserProps> = ({ 
  directoryId, 
  domainId, 
  domainInfo 
}) => {
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

  // Helper function to check if a document is a directory
  const isDirectory = (doc: UserDocument) => {
    return (doc.local?.type === DocumentType.DIRECTORY) || (doc.cloud?.type === DocumentType.DIRECTORY);
  };

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
      // Get root level documents - with or without domain filtering
      const rootItems = documents.filter((doc) => {
        const localParentId = doc.local?.parentId;
        const cloudParentId = doc.cloud?.parentId;
        const localDomainId = doc.local?.domainId;
        const cloudDomainId = doc.cloud?.domainId;

        // If we're browsing a specific domain, only include documents from that domain
        if (domainId) {
          // Check if the document belongs to this domain
          const belongsToDomain = localDomainId === domainId || cloudDomainId === domainId;
          
          // Document must belong to this domain and be at the root level (no parent)
          return belongsToDomain && (!localParentId && !cloudParentId);
        } else {
          // In the normal browse view, filter out documents that belong to a domain
          const hasDomain = localDomainId || cloudDomainId;
          if (hasDomain) {
            return false; // Filter out documents that belong to a domain
          }

          // Special handling for cloud documents:
          // If it's a cloud document but parentId is undefined (not null),
          // we need to treat it differently since the field might be missing in the API response
          if (doc.cloud && cloudParentId === undefined) {
            // For root browsing, we only include documents without a domain
            return !cloudDomainId;
          }

          return (!localParentId && !cloudParentId);
        }
      });

      setChildItems(rootItems);

      // Debug logging for root document filtering
      console.log(domainId ? "Domain root documents filtering:" : "Root documents filtering:", {
        totalDocuments: documents.length,
        filteredRootDocuments: rootItems.length,
        rootDocuments: rootItems.map((doc) => ({
          id: doc.id,
          name: doc.local?.name || doc.cloud?.name,
          localParentId: doc.local?.parentId,
          cloudParentId: doc.cloud?.parentId,
          localDomainId: doc.local?.domainId,
          cloudDomainId: doc.cloud?.domainId,
        })),
      });
    }
  }, [directoryId, documents, domainId]);

  // Function to get the correct URL for a document or directory
  const getDocumentUrl = (doc: UserDocument) => {
    const docId = doc.id;
    const isDir = isDirectory(doc);
    
    // If we're in a domain context
    if (domainInfo) {
      if (isDir) {
        return `/domains/${domainInfo.slug}/${docId}`;
      } else {
        return `/domains/${domainInfo.slug}/view/${docId}`;
      }
    }
    
    // Default personal documents URL
    if (isDir) {
      return `/browse/${docId}`;
    } else {
      return `/view/${docId}`;
    }
  };

  // Process items for display
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
    let url = "/new";
    const params = new URLSearchParams();
    
    if (directoryId) {
      params.append("parentId", directoryId);
    }
    
    if (domainId) {
      params.append("domain", domainId);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    router.push(url);
  };

  // Handle creating a new directory
  const handleCreateDirectory = () => {
    let url = "/new-directory";
    const params = new URLSearchParams();
    
    if (directoryId) {
      url += `/${directoryId}`;
    }
    
    if (domainId) {
      params.append("domain", domainId);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    router.push(url);
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
            href={domainInfo ? `/domains/${domainInfo.slug}` : "/browse"}
            startIcon={<ArrowBack />}
            variant="contained"
            sx={{ borderRadius: 1.5, mt: 2 }}
          >
            Back to {domainInfo ? `${domainInfo.name}` : "Document Browser"}
          </Button>
        </Box>
      </Container>
    );
  }

  // Get page title - either directory name or "Home"
  const pageTitle = directoryId
    ? (currentDirectory?.local?.name || currentDirectory?.cloud?.name ||
      "Directory")
    : domainInfo 
      ? domainInfo.name
      : "Personal Documents";

  return (
    <DragProvider>
      <DocumentURLProvider getDocumentUrl={getDocumentUrl}>
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
            {/* Domain info section - only shown when viewing a domain */}
            {domainInfo && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: domainInfo.color || "primary.main",
                      color: "#fff",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                    }}
                  >
                    {domainInfo.icon ? (
                      <Box component="span" sx={{ fontSize: "1.2rem" }}>
                        {domainInfo.icon}
                      </Box>
                    ) : (
                      <LibraryBooks sx={{ fontSize: "1.2rem" }} />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="h6" component="h1">
                      {domainInfo.name}
                    </Typography>
                    {domainInfo.description && (
                      <Typography variant="body2" color="text.secondary">
                        {domainInfo.description}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  href={`/domains/edit/${domainInfo.id}`}
                  startIcon={<Settings fontSize="small" />}
                >
                  Settings
                </Button>
              </Paper>
            )}

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
                  {domainInfo ? (
                    <Link
                      href={`/domains/${domainInfo.slug}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: directoryId ? "inherit" : "text.primary",
                        textDecoration: "none",
                        fontWeight: directoryId ? "normal" : "medium",
                      }}
                    >
                      <LibraryBooks sx={{ mr: 0.5 }} fontSize="inherit" />
                      {domainInfo.name}
                    </Link>
                  ) : (
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
                      Personal Documents
                    </Link>
                  )}

                  {directoryId && breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const hrefPrefix = domainInfo 
                      ? `/domains/${domainInfo.slug}` 
                      : `/browse`;

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
                        href={`${hrefPrefix}/${crumb.id}`}
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
                    {directoryId
                      ? "This folder is empty"
                      : domainInfo
                        ? `No documents in ${domainInfo.name} yet`
                        : "No personal documents found"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    {directoryId
                      ? "Create a new document or folder to get started"
                      : domainInfo
                        ? "Create a document or folder in this domain to get started"
                        : "Create a new document or folder to get started (Items in domains are not shown here)"
                    }
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
      </DocumentURLProvider>
      <TrashBin />
    </DragProvider>
  );
};

export default DocumentBrowser;
