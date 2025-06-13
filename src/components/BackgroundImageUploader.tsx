"use client"
import { useState } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { UploadFile, Delete } from '@mui/icons-material';
import { UserDocument, isDirectory, DocumentType } from '@/types';
import { useDispatch, actions } from '@/store';

interface BackgroundImageUploaderProps {
  userDocument: UserDocument;
  onChange: (imagePath: string | null) => void;
  currentImage: string | null;
}

const BackgroundImageUploader = ({ userDocument, onChange, currentImage }: BackgroundImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const dispatch = useDispatch();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      dispatch(actions.announce({
        message: {
          title: "Invalid File Type",
          subtitle: "Please select an image file."
        }
      }));
      return;
    }

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Prepare form data for upload
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      
      // Get document ID
      const documentId = userDocument.cloud?.id || userDocument.local?.id;
      if (!documentId) {
        throw new Error("Document ID not found");
      }

      // Check if this is a directory before uploading
      const document = userDocument.cloud || userDocument.local;
      console.log("Document data:", {
        hasCloud: !!userDocument.cloud,
        hasLocal: !!userDocument.local,
        cloudType: userDocument.cloud?.type,
        localType: userDocument.local?.type,
        documentType: document?.type,
        isDirectoryCheck: document?.type === DocumentType.DIRECTORY,
        rawDocumentType: typeof document?.type === 'string' ? document?.type : 'not a string',
        DocumentTypeENUM: {
          DIRECTORY: DocumentType.DIRECTORY,
          DOCUMENT: DocumentType.DOCUMENT
        }
      });
      
      if (!document) {
        throw new Error("Document not found");
      }
      
      // Check document type
      if (document.type !== DocumentType.DIRECTORY) {
        console.error("Not a directory - document type:", document.type, 
                      "Expected:", DocumentType.DIRECTORY);
        throw new Error(`This document is not a directory (type: ${document.type})`);
      }

      console.log("Uploading image for directory:", documentId);
      
      // Upload the image
      const response = await fetch(`/api/documents/${documentId}/background`, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      console.log("Response from server:", responseData);
      
      if (!response.ok) {
        const errorMessage = responseData.error?.subtitle || responseData.error?.title || "Upload failed";
        throw new Error(errorMessage);
      }

      const imagePath = responseData.data?.background_image;
      
      if (imagePath) {
        onChange(imagePath);
        dispatch(actions.announce({
          message: {
            title: "Background Image Updated",
            subtitle: "Your directory background has been updated."
          }
        }));
      } else {
        throw new Error("No image path returned from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      dispatch(actions.announce({
        message: {
          title: "Upload Failed",
          subtitle: error instanceof Error ? error.message : "Please try again later."
        }
      }));
      // Reset preview on error
      if (currentImage) {
        setPreviewUrl(currentImage);
      } else {
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onChange(null);
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Directory Background Image
      </Typography>
      
      {previewUrl ? (
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          height: 120, 
          backgroundImage: `url(${previewUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 1,
          mb: 1
        }}>
          <Button 
            variant="contained" 
            color="error" 
            size="small"
            onClick={handleRemoveImage}
            startIcon={<Delete />}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              bottom: 8,
              opacity: 0.8,
              '&:hover': {
                opacity: 1
              }
            }}
          >
            Remove
          </Button>
        </Box>
      ) : (
        <Box sx={{ 
          width: '100%', 
          height: 120, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          mb: 1
        }}>
          <Typography variant="body2" color="text.secondary" align="center">
            No background image selected
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={isUploading ? <CircularProgress size={20} /> : <UploadFile />}
          disabled={isUploading}
          sx={{ mr: 1 }}
        >
          {isUploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </Button>
        
        <Typography variant="caption" color="text.secondary">
          Recommended size: 1280x720 or similar ratio
        </Typography>
      </Box>
    </Box>
  );
};

export default BackgroundImageUploader;
