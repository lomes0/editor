"use client";
import { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { 
  Add, 
  FilterList, 
  Functions, 
  Edit, 
  Share, 
  Folder, 
  Cloud
} from "@mui/icons-material";
import { DocumentType, UserDocument } from "@/types";
import { actions, useDispatch, useSelector } from "@/store";
import DocumentCard from "../DocumentCard/DocumentCard";
import FilterControl from "../DocumentControls/FilterControl";
import DocumentSortControl from "../DocumentControls/SortControl";
import { sortDocuments } from "../DocumentControls/sortDocuments";
import { filterDocuments } from "../DocumentControls/FilterControl";
import { v4 as uuid } from "uuid";

const Home: React.FC<{ staticDocuments: UserDocument[] }> = ({ staticDocuments }) => {
  const dispatch = useDispatch();
  const documents = useSelector((state) => state.documents);
  const user = useSelector((state) => state.user);
  
  const [filteredDocuments, setFilteredDocuments] = useState<UserDocument[]>([]);
  const [filterValue, setFilterValue] = useState(0);
  const [sortValue, setSortValue] = useState({
    key: "updatedAt",
    direction: "desc",
  });

  // Use documents from state if available, otherwise use static documents
  const allDocuments = documents.length > 0 ? documents : staticDocuments;

  useEffect(() => {
    // Apply filtering and sorting
    const filtered = filterDocuments(allDocuments, user, filterValue);
    const sorted = sortDocuments(filtered, sortValue.key, sortValue.direction);
    setFilteredDocuments(sorted);
  }, [allDocuments, user, filterValue, sortValue]);

  const handleCreateDocument = () => {
    const id = uuid();
    dispatch(
      actions.createLocalDocument({
        id,
        name: "Untitled Document",
        head: id,
        type: DocumentType.DOCUMENT,
        data: {
          root: {
            children: [],
            direction: null,
            format: "left",
            indent: 0,
            type: "root",
            version: 1,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  };

  const handleCreateDirectory = () => {
    const id = uuid();
    dispatch(
      actions.createLocalDocument({
        id,
        name: "New Directory",
        head: id,
        type: DocumentType.DIRECTORY,
        data: {
          root: {
            children: [],
            direction: null,
            format: "left",
            indent: 0,
            type: "root",
            version: 1,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  };

  const recentDocuments = filteredDocuments
    .filter(doc => {
      const document = doc.local || doc.cloud;
      return document?.type === DocumentType.DOCUMENT;
    })
    .slice(0, 4);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          background: 'linear-gradient(to right, #f5f7fa, #e4e7eb)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ mb: { xs: 2, md: 0 } }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Math Editor
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            Create, edit, and share mathematical documents with ease. 
            Our editor supports LaTeX, diagrams, and collaborative editing.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={handleCreateDocument}
          >
            New Document
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Add />}
            onClick={handleCreateDirectory}
          >
            New Directory
          </Button>
        </Box>
      </Paper>
      
      {/* Filter and sort controls */}
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          flexWrap: 'wrap',
          mb: 4,
          gap: 2
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', sm: '85%', md: '90%', lg: '92%' },
            overflow: 'hidden'
          }}
        >
          <FilterControl 
            value={filterValue} 
            setValue={setFilterValue} 
            sx={{ maxWidth: '100%' }}
          />
        </Box>
        <Box sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>
          <DocumentSortControl value={sortValue} setValue={setSortValue} />
        </Box>
      </Box>

      {/* Recent Documents section */}
      {recentDocuments.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Recent Documents
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {recentDocuments.map((document) => (
              <Grid key={document.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}>
                <DocumentCard userDocument={document} user={user} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Home;
