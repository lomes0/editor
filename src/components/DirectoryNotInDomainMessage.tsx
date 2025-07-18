"use client";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { MoveToInbox, VisibilityOutlined } from "@mui/icons-material";

interface DirectoryNotInDomainMessageProps {
  directoryId: string;
  directoryName: string;
  domainId: string;
  domainName: string;
  canEdit: boolean;
}

/**
 * Component shown when a directory exists but isn't in the requested domain
 */
export default function DirectoryNotInDomainMessage({
  directoryId,
  directoryName,
  domainId,
  domainName,
  canEdit,
}: DirectoryNotInDomainMessageProps) {
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
          Directory Not In This Domain
        </Typography>

        <Typography variant="body1" paragraph>
          The directory <strong>{directoryName}</strong>{" "}
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
            onClick={() => router.push(`/browse/${directoryId}`)}
          >
            View Directory
          </Button>

          {canEdit && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<MoveToInbox />}
              onClick={async () => {
                try {
                  // API call to move directory to this domain
                  const response = await fetch(
                    `/api/documents/${directoryId}`,
                    {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        domainId: domainId,
                      }),
                    },
                  );

                  if (response.ok) {
                    // If successful, reload the page to show the directory in this domain
                    router.refresh();
                  } else {
                    console.error("Failed to move directory to domain");
                  }
                } catch (error) {
                  console.error("Error moving directory to domain:", error);
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
