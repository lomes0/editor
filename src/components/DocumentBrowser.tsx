"use client"
import { useDispatch, useSelector, actions } from '@/store';
import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Divider, Container, Fade, Tooltip, Breadcrumbs } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { CreateNewFolder, Folder, PostAdd, Article, FilterList, Home as HomeIcon } from '@mui/icons-material';
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in={true} timeout={600}>
        <Box className="document-browser-container" sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
          {/* Enhanced breadcrumb for root */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            pl: 0.5,
            mb: 1,
            color: 'text.secondary',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -4,
              left: 0,
              width: '100%',
              height: '1px',
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              zIndex: 1
            }
          }}>
            <Breadcrumbs 
              aria-label="breadcrumb"
              className="breadcrumb-animated"
              separator={<Box component="span" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                opacity: 0.5,
                mx: 0.5,
                color: 'text.disabled'
              }}>
                /
              </Box>}
              sx={{ 
                '& .MuiBreadcrumbs-ol': { 
                  flexWrap: { xs: 'wrap', md: 'nowrap' },
                  padding: '4px',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.01)'
                  }
                },
                '& a': { 
                  transition: 'all 0.2s ease',
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  textDecoration: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(0, 0, 0, 0.03)'
                  }
                }
              }}
            >
              <Tooltip 
                title="Home directory"
                arrow
              >
                <Typography 
                  className="breadcrumb-item breadcrumb-active"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    fontWeight: 'medium',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    ...(sortedDirectories.length + sortedDocuments.length === 0 ? {
                      borderBottom: '1px dashed',
                      borderColor: 'warning.light'
                    } : {})
                  }}
                >
                  <HomeIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                  Documents
                  <Box 
                    component="span" 
                    sx={{ 
                      ml: 1, 
                      fontSize: '0.7rem', 
                      opacity: 0.7, 
                      backgroundColor: 'rgba(0, 0, 0, 0.04)', 
                      px: 0.7, 
                      py: 0.2, 
                      borderRadius: 1,
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    {sortedDirectories.length + sortedDocuments.length} item{sortedDirectories.length + sortedDocuments.length !== 1 ? 's' : ''}
                  </Box>
                </Typography>
              </Tooltip>
            </Breadcrumbs>
          </Box>

          {/* Page header with modern styling */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 2,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 'medium',
                  color: 'text.primary',
                }}
              >
                Document Library
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1.5,
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              width: { xs: '100%', md: 'auto' },
              justifyContent: { xs: 'center', md: 'flex-end' },
            }}>
              <Tooltip title="Create a new document">
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<PostAdd />}
                  onClick={handleCreateDocument}
                  sx={{ 
                    borderRadius: 1.5,
                    px: 2,
                    boxShadow: 1
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
                    px: 2
                  }}
                >
                  New Folder
                </Button>
              </Tooltip>
              
              <Tooltip title="Sort your documents">
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: 'background.paper',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box sx={{ 
                    display: { xs: 'none', sm: 'flex' }, 
                    alignItems: 'center', 
                    px: 1.5, 
                    height: '100%',
                    borderRight: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <FilterList fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">Sort</Typography>
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
          {sortedDirectories.length === 0 && sortedDocuments.length === 0 ? (
            <Paper 
              elevation={0}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                p: 6, 
                gap: 2,
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}
            >
              <PostAdd sx={{ width: 64, height: 64, color: 'text.secondary', opacity: 0.6 }} />
              <Typography variant="h6">No content found</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
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
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Display directories section */}
              {sortedDirectories.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 1,
                    pl: 1
                  }}>
                    <Folder color="primary" />
                    <Typography variant="h6" fontWeight="medium">Folders</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {sortedDirectories.map(directory => (
                      <Grid key={directory.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <DocumentCard userDocument={directory} user={user} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              
              {/* Display documents section */}
              {sortedDocuments.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {sortedDirectories.length > 0 && (
                    <Divider sx={{ my: 1 }} />
                  )}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 1,
                    pl: 1
                  }}>
                    <Article color="primary" />
                    <Typography variant="h6" fontWeight="medium">Documents</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {sortedDocuments.map(document => (
                      <Grid key={document.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <DocumentCard userDocument={document} user={user} />
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
