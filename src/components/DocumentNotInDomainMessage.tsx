"use client";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { MoveToInbox, VisibilityOutlined } from "@mui/icons-material";

interface DocumentNotInDomainMessageProps {
  documentId: string;
  documentName: string;
  domainId: string;
  domainName: string;
  canEdit: boolean;
}

/**
 * Component shown when a document exists but isn't in the requested domain
 */
export default function DocumentNotInDomainMessage({
  documentId,
  documentName,
  domainId,
  domainName,
  canEdit,
}: DocumentNotInDomainMessageProps) {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          mx: "auto",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Document Not In This Domain
        </Typography>

        <Typography variant="body1" paragraph>
          The document <strong>{documentName}</strong>{" "}
          exists, but it isn't associated with the <strong>{domainName}</strong>
          {" "}
          domain.
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 3 }}
        >
          <Button
            variant="outlined"
            startIcon={<VisibilityOutlined />}
            onClick={() => router.push(`/view/${documentId}`)}
          >
            View Document
          </Button>

          {canEdit && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<MoveToInbox />}
              onClick={async () => {
                try {
                  // API call to move document to this domain
                  const response = await fetch(`/api/documents/${documentId}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      domainId: domainId,
                    }),
                  });

                  if (response.ok) {
                    // If successful, reload the page to show the document in this domain
                    router.refresh();
                  } else {
                    console.error("Failed to move document to domain");
                  }
                } catch (error) {
                  console.error("Error moving document to domain:", error);
                }
              }}
            >
              Move to {domainName}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
