"use client"
import { useDispatch, useSelector, actions } from '@/store';
import { useEffect, useState } from 'react';
import { Box, Breadcrumbs, Typography, Button, Paper, Divider } from "@mui/material";
import Grid from '@mui/material/Grid2';
import Link from 'next/link';
import { CreateNewFolder, ArrowBack, Home as HomeIcon, Folder, PostAdd } from '@mui/icons-material';
import DocumentCard from './DocumentCard';
import { DocumentType, UserDocument } from '@/types';
import DocumentSortControl from './DocumentControls/SortControl';
import { sortDocuments } from './DocumentControls/sortDocuments';
import { v4 as uuid } from 'uuid';
import { useRouter } from 'next/navigation';

interface DirectoryBrowserProps {
  directoryId: string;
}

const DirectoryBrowser: React.FC<DirectoryBrowserProps> = ({ directoryId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const documents = useSelector(state => state.documents);
  const user = useSelector(state => state.user);
  const [loading, setLoading] = useState(true);
  const [currentDirectory, setCurrentDirectory] = useState<UserDocument | null>(null);
  const [childItems, setChildItems] = useState<UserDocument[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string; }[]>([]);
  const [sortValue, setSortValue] = useState({ key: 'updatedAt', direction: 'desc' });
  
  // Load directory and its contents
  useEffect(() => {
    const loadDirectory = async () => {
      setLoading(true);
      
      // Find the current directory
      const directory = documents.find(doc => 
        (doc.local?.id === directoryId || doc.cloud?.id === directoryId) && 
        ((doc.local?.type === DocumentType.DIRECTORY) || (doc.cloud?.type === DocumentType.DIRECTORY))
      );
      
      if (directory) {
        setCurrentDirectory(directory);
        
        // Build breadcrumb trail
        const buildBreadcrumbs = (docId: string, trail: { id: string; name: string; }[] = []) => {
          const doc = documents.find(d => d.local?.id === docId || d.cloud?.id === docId);
          if (!doc) return trail;
          
          const name = doc.local?.name || doc.cloud?.name || '';
          const parentId = doc.local?.parentId || doc.cloud?.parentId;
          
          const newTrail = [{ id: docId, name }, ...trail];
          
          if (parentId) {
            return buildBreadcrumbs(parentId, newTrail);
          }
          
          return newTrail;
        };
        
        setBreadcrumbs(buildBreadcrumbs(directoryId));
        
        // Find child documents and directories
        const children = documents.filter(doc => {
          const localParentId = doc.local?.parentId;
          const cloudParentId = doc.cloud?.parentId;
          return localParentId === directoryId || cloudParentId === directoryId;
        });
        
        setChildItems(children);
      }
      
      setLoading(false);
    };
    
    loadDirectory();
  }, [directoryId, documents]);

  // Separate directories and documents for better organization
  // Function to determine if a document is a directory
  const isDirectory = (doc: UserDocument) => 
    (doc.local?.type === DocumentType.DIRECTORY) || 
    (doc.cloud?.type === DocumentType.DIRECTORY);
  
  // Use Set to track processed IDs to prevent duplicates
  const processedIds = new Set<string>();
  const directories: UserDocument[] = [];
  const regularDocuments: UserDocument[] = [];
  
  // Process each item once, categorizing it appropriately
  childItems.forEach(doc => {
    if (processedIds.has(doc.id)) return;
    processedIds.add(doc.id);
    
    if (isDirectory(doc)) {
      directories.push(doc);
    } else {
      regularDocuments.push(doc);
    }
  });
  
  // Apply sorting
  const sortedDirectories = sortDocuments(directories, sortValue.key, sortValue.direction);
  const sortedDocuments = sortDocuments(regularDocuments, sortValue.key, sortValue.direction);

  // Handle creating a new document in this directory
  const handleCreateDocument = () => {
    router.push(`/new?parentId=${directoryId}`);
  };

  // Handle creating a new directory
  const handleCreateDirectory = () => {
    router.push(`/new-directory/${directoryId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading directory contents...</Typography>
      </Box>
    );
  }

  // Render empty state if directory not found
  if (!currentDirectory) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, gap: 2 }}>
        <Folder sx={{ width: 64, height: 64 }} />
        <Typography variant="h6">Directory not found</Typography>
        <Button component={Link} href="/browse" startIcon={<ArrowBack />}>
          Back to Document Browser
        </Button>
      </Box>
    );
  }

  // Get directory name
  const directoryName = currentDirectory.local?.name || currentDirectory.cloud?.name || 'Directory';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Breadcrumb navigation */}
      <Paper sx={{ p: 1.5, mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link href="/browse" style={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Root
          </Link>
          
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            if (isLast) {
              return (
                <Typography key={crumb.id} color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Folder sx={{ mr: 0.5 }} fontSize="inherit" />
                  {crumb.name}
                </Typography>
              );
            }
            
            return (
              <Link key={crumb.id} href={`/browse/${crumb.id}`} style={{ display: 'flex', alignItems: 'center' }}>
                <Folder sx={{ mr: 0.5 }} fontSize="inherit" />
                {crumb.name}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Paper>
      
      {/* Directory title and controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <Folder sx={{ mr: 1 }} /> {directoryName}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<PostAdd />}
            onClick={handleCreateDocument}
          >
            New Document
          </Button>
          
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
      
      {/* No items message */}
      {childItems.length === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, gap: 2 }}>
          <Folder sx={{ width: 64, height: 64 }} />
          <Typography variant="h6">This directory is empty</Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new document or directory to get started
          </Typography>
        </Box>
      )}
      
      {/* Combined content section */}
      {childItems.length > 0 && (
        <>
          <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            Content
          </Typography>
          
          <Grid container spacing={2}>
            {/* Display directories first */}
            {sortedDirectories.map(directory => (
              <Grid key={directory.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <DocumentCard userDocument={directory} user={user} />
              </Grid>
            ))}
            
            {/* Then display documents */}
            {sortedDocuments.map(document => (
              <Grid key={document.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <DocumentCard userDocument={document} user={user} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DirectoryBrowser;
