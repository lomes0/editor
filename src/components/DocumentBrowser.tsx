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
  
  // Filter to ensure we don't duplicate directories and documents
  // A document is considered a directory if either its local or cloud version is a directory
  const isDirectory = (doc: UserDocument) => 
    (doc.local?.type === DocumentType.DIRECTORY) || 
    (doc.cloud?.type === DocumentType.DIRECTORY);
    
  const directories = rootItems.filter(doc => isDirectory(doc));
  
  const regularDocuments = rootItems.filter(doc => !isDirectory(doc));
  
  // Apply sorting
  const sortedDirectories = sortDocuments(directories, sortValue.key, sortValue.direction);
  const sortedDocuments = sortDocuments(regularDocuments, sortValue.key, sortValue.direction);

  // Handle creating a new document
  const handleCreateDocument = () => {
    router.push('/new');
  };

  // Handle creating a new directory
  const handleCreateDirectory = () => {
    router.push('/new-directory');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Page header with actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2,
        mb: 2
      }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <Folder sx={{ mr: 1 }} /> Document Browser
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
      
      {/* Combined content section */}
      
      {sortedDirectories.length === 0 && sortedDocuments.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, gap: 2 }}>
          <PostAdd sx={{ width: 64, height: 64 }} />
          <Typography variant="h6">No content found</Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new document or directory to get started
          </Typography>
        </Box>
      ) : (
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
      )}
    </Box>
  );
};

export default DocumentBrowser;
