"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import Documents from "./Documents";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { UserDocument } from "@/types";
import PwaUpdater from "./PwaUpdater";
import { CreateNewFolder, PostAdd, Storage } from "@mui/icons-material";

const Home: React.FC<{ staticDocuments: UserDocument[] }> = (
  { staticDocuments },
) => {
  const [welcomed, setWelcomed] = useLocalStorage("welcomed", false);
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const handleClose = () => setWelcomed(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Documents staticDocuments={staticDocuments} />
      {!welcomed && (
        <Dialog open onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Welcome to Math Editor</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Welcome to your math workspace! Here you can create and organize your content.
            </DialogContentText>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>
                Getting Started:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PostAdd color="primary" />
                <Typography variant="body2">
                  Create documents with the "New Document" button
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreateNewFolder color="primary" />
                <Typography variant="body2">
                  Organize your work in directories with the "Directory" button
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Storage color="primary" />
                <Typography variant="body2">
                  Back up your work to save it for later
                </Typography>
              </Box>
            </Box>
            <DialogContentText>
              Would you like to take a tour of these features?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Dismiss</Button>
            <Button
              onClick={() => {
                navigate("/tutorial");
                handleClose();
              }}
              variant="contained"
            >
              Launch the Tutorial
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <PwaUpdater />
    </>
  );
};

export default Home;
