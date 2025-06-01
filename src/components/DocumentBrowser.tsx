"use client"
import { useDispatch, useSelector, actions } from '@/store';
import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Divider } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { CreateNewFolder, Folder, PostAdd } from '@mui/icons-material';
import DocumentCard from './DocumentCard';
import { DocumentType, UserDocument } from '@/types';
import DocumentSortControl from './DocumentControls/SortControl';
import { sortDocuments } from './DocumentControls/sortDocuments';
import Link from 'next/link';
import { v4 as uuid } from 'uuid';
import { useRouter } from 'next/navigation';

const DocumentBrowser: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const documents = useSelector(state => state.documents);
  const user = useSelector(state => state.user);
  const [sortValue, setSortValue] = useState({ key: 'updatedAt', direction: 'desc' });
  
  // Get root level documents and directories (items without a parentId)
  const rootItems = documents.filter(doc => {
    const localParentId = doc.local?.parentId;
    const cloudParentId = doc.cloud?.parentId;
    return !localParentId && !cloudParentId;
  });
  
  // Separate directories and documents for better organization
  const directories = rootItems.filter(doc => 
    (doc.local?.type === DocumentType.DIRECTORY) || 
    (doc.cloud?.type === DocumentType.DIRECTORY)
  );
  
  const regularDocuments = rootItems.filter(doc => 
    (doc.local?.type === DocumentType.DOCUMENT || doc.local?.type === undefined) || 
    (doc.cloud?.type === DocumentType.DOCUMENT || doc.cloud?.type === undefined)
  );
  
  // Apply sorting
  const sortedDirectories = sortDocuments(directories, sortValue.key, sortValue.direction);
  const sortedDocuments = sortDocuments(regularDocuments, sortValue.key, sortValue.direction);

  // Handle creating a new document
  const handleCreateDocument = () => {
    router.push('/new');
  };

  // Handle creating a new directory
  const handleCreateDirectory = async () => {
    const alert = {
      title: "Create New Directory",
      content: "What would you like to name your new directory?",
      actions: [
        { label: "Cancel", id: "cancel" },
        { label: "Create", id: "create" }
      ]
    };
    
    const response = await dispatch(actions.alert(alert));
    if (response.payload === "create") {
      // Create directory document with DIRECTORY type
      dispatch(actions.createLocalDocument({
        id: uuid(),
        name: "New Directory",
        type: DocumentType.DIRECTORY,
        parentId: null, // Root level directory
        head: uuid(),
        data: { root: { children: [], direction: null, format: "", indent: 0, type: "root", version: 1 } },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">Document Browser</Typography>
        
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
      
      {/* Directories section */}
      {sortedDirectories.length > 0 && (
        <>
          <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Folder sx={{ mr: 1 }} /> Directories
          </Typography>
          
          <Grid container spacing={2}>
            {sortedDirectories.map(directory => (
              <Grid key={directory.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <DocumentCard userDocument={directory} user={user} />
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 2 }} />
        </>
      )}
      
      {/* Documents section */}
      <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', mt: sortedDirectories.length ? 0 : 2 }}>
        <PostAdd sx={{ mr: 1 }} /> Documents
      </Typography>
      
      {sortedDocuments.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, gap: 2 }}>
          <PostAdd sx={{ width: 64, height: 64 }} />
          <Typography variant="h6">No documents found</Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new document to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {sortedDocuments.map(document => (
            <Grid key={document.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <DocumentCard userDocument={document} user={user} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DocumentBrowser;
