"use client";
import { FC, useCallback } from "react";
import { Button, Box, Tooltip } from "@mui/material";
import { UploadFile, Storage } from "@mui/icons-material";
import { useDispatch, actions, useSelector } from "@/store";
import { BackupDocument } from "@/types";
import { v4 as uuid } from "uuid";
import documentDB, { revisionDB } from "@/indexeddb";

type ImportExportControlProps = {
  handleFilesChange?: (files: FileList | File[] | null, createNewDirectory?: boolean) => Promise<void>;
  backupFunction?: () => Promise<void>;
};

const ImportExportControl: FC<ImportExportControlProps> = ({ handleFilesChange, backupFunction }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (handleFilesChange) {
      await handleFilesChange(e.target.files, true); // Pass true to indicate we want to import into a new directory
    }
  }, [handleFilesChange]);

  const handleBackup = useCallback(async () => {
    if (backupFunction) {
      await backupFunction();
    } else {
      try {
        const documents = await documentDB.getAll();
        const revisions = await revisionDB.getAll();
        const data: BackupDocument[] = documents.map((document) => ({
          ...document,
          revisions: revisions.filter((revision) =>
            revision.documentId === document.id &&
            revision.id !== document.head
          ),
        }));

        const blob = new Blob([JSON.stringify(data)], {
          type: "text/json",
        });
        const link = window.document.createElement("a");

        const now = new Date();
        link.download = now.toISOString() + ".me";
        link.href = window.URL.createObjectURL(blob);
        link.dataset.downloadurl = ["text/json", link.download, link.href]
          .join(":");

        const evt = new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: true,
        });

        link.dispatchEvent(evt);
        link.remove();
      } catch (error) {
        dispatch(
          actions.announce({
            message: {
              title: "Backup failed",
              subtitle: "Please try again",
            },
          }),
        );
      }
    }
  }, [backupFunction, dispatch]);

  // Determine button text and tooltip based on whether user is logged in
  const importTooltip = user
    ? "Import files into a new timestamped 'New_Files' directory and save to cloud"
    : "Import files into a new timestamped 'New_Files' directory";

  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title={importTooltip}>
        <Button
          variant="outlined"
          sx={{ px: 1, "& .MuiButton-startIcon": { ml: 0 } }}
          startIcon={<UploadFile />}
          component="label"
        >
          Import
          <input
            type="file"
            hidden
            accept=".me"
            multiple
            onChange={handleFileUpload}
          />
        </Button>
      </Tooltip>
      <Tooltip title="Backup all documents to a .me file">
        <Button
          variant="outlined"
          sx={{ px: 1, "& .MuiButton-startIcon": { ml: 0 } }}
          startIcon={<Storage />}
          onClick={handleBackup}
        >
          Backup
        </Button>
      </Tooltip>
    </Box>
  );
};

export default ImportExportControl;
