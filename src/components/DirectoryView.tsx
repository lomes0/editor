"use client";
import { actions, useDispatch, useSelector } from "@/store";
import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Button, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Link from "next/link";
import {
  ArrowBack,
  CreateNewFolder,
  Folder,
  Home as HomeIcon,
} from "@mui/icons-material";
import CardSelector from "./DocumentCard";
import { DocumentType, UserDocument } from "@/types";
import DocumentSortControl from "./DocumentControls/SortControl";
import { sortDocuments } from "./DocumentControls/sortDocuments";
import { v4 as uuid } from "uuid";

interface DirectoryViewProps {
  directoryId: string;
}

const DirectoryView: React.FC<DirectoryViewProps> = ({ directoryId }) => {
  const dispatch = useDispatch();
  const documents = useSelector((state) => state.documents);
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [currentDirectory, setCurrentDirectory] = useState<
    UserDocument | null
  >(null);
  const [childDocuments, setChildDocuments] = useState<UserDocument[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string; name: string }[]
  >([]);
  const [sortValue, setSortValue] = useState({
    key: "updatedAt",
    direction: "desc",
  });

  // Load directory and its contents
  useEffect(() => {
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

        // Find child documents
        const children = documents.filter((doc) => {
          const localParentId = doc.local?.parentId;
          const cloudParentId = doc.cloud?.parentId;
          return localParentId === directoryId ||
            cloudParentId === directoryId;
        });

        setChildDocuments(children);
      }

      setLoading(false);
    };

    loadDirectory();
  }, [directoryId, documents]);

  // Handle creating a new directory
  const handleCreateDirectory = async () => {
    const alert = {
      title: "Create New Directory",
      content: "What would you like to name your new directory?",
      actions: [
        { label: "Cancel", id: "cancel" },
        { label: "Create", id: "create" },
      ],
    };

    const response = await dispatch(actions.alert(alert));
    if (response.payload === "create") {
      // Create directory document with DIRECTORY type
      dispatch(actions.createLocalDocument({
        id: uuid(),
        name: "New Directory",
        type: DocumentType.DIRECTORY,
        parentId: directoryId,
        head: uuid(),
        data: {
          root: {
            children: [],
            direction: null,
            format: "",
            indent: 0,
            type: "root",
            version: 1,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  // Apply sorting
  const sortedDocuments = sortDocuments(
    childDocuments,
    sortValue.key,
    sortValue.direction,
  );

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography>Loading directory contents...</Typography>
      </Box>
    );
  }

  // Render empty state if directory not found
  if (!currentDirectory) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
          gap: 2,
        }}
      >
        <Folder sx={{ width: 64, height: 64 }} />
        <Typography variant="h6">Directory not found</Typography>
        <Button
          component={Link}
          href="/browse"
          startIcon={<ArrowBack />}
        >
          Back to Document Browser
        </Button>
      </Box>
    );
  }

  // Get directory name
  const directoryName = currentDirectory.local?.name ||
    currentDirectory.cloud?.name || "Directory";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Breadcrumb navigation */}
      <Paper sx={{ p: 1.5, mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            href="/browse"
            style={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>

          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            if (isLast) {
              return (
                <Typography
                  key={crumb.id}
                  color="text.primary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
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
                }}
              >
                <Folder sx={{ mr: 0.5 }} fontSize="inherit" />
                {crumb.name}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Paper>

      {/* Directory title and controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" component="h1">
          <Folder sx={{ verticalAlign: "middle", mr: 1 }} />
          {directoryName}
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CreateNewFolder />}
            onClick={handleCreateDirectory}
          >
            New Directory
          </Button>

          <DocumentSortControl
            value={sortValue}
            setValue={setSortValue}
          />
        </Box>
      </Box>

      {/* Directory contents */}
      {sortedDocuments.length === 0
        ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 4,
              gap: 2,
            }}
          >
            <Folder sx={{ width: 64, height: 64 }} />
            <Typography variant="h6">
              This directory is empty
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new document or directory, or move existing items here.
            </Typography>
          </Box>
        )
        : (
          <Grid container spacing={2}>
            {sortedDocuments.map((document) => (
              <Grid
                key={document.id}
                size={{ xs: 12, sm: 6, md: 4 }}
              >
                <CardSelector
                  userDocument={document}
                  user={user}
                />
              </Grid>
            ))}
          </Grid>
        )}
    </Box>
  );
};

export default DirectoryView;
