"use client";
import React from "react";
import { Box, Button, Tooltip } from "@mui/material";
import {
  CreateNewFolder,
  FilterList,
  PostAdd,
  Settings,
} from "@mui/icons-material";
import Link from "next/link";
import DocumentSortControl from "../../DocumentControls/SortControl";

interface BrowserHeaderProps {
  onCreateDocument: () => void;
  onCreateDirectory: () => void;
  sortValue: { key: string; direction: string };
  setSortValue: (value: { key: string; direction: string }) => void;
  domainInfo?: any;
}

/**
 * Header component with action buttons and controls for the document browser
 */
const BrowserHeader: React.FC<BrowserHeaderProps> = ({
  onCreateDocument,
  onCreateDirectory,
  sortValue,
  setSortValue,
  domainInfo,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexWrap: { xs: "wrap", sm: "nowrap" },
        width: { xs: "100%", md: "auto" },
        justifyContent: {
          xs: "center",
          md: "flex-end",
        },
      }}
    >
      <Tooltip title="Create a new document">
        <Button
          variant="outlined"
          startIcon={<PostAdd />}
          onClick={onCreateDocument}
          sx={{
            borderRadius: 1.5,
            px: 2,
          }}
        >
          New Document
        </Button>
      </Tooltip>

      <Tooltip title="Create a new folder">
        <Button
          variant="outlined"
          startIcon={<CreateNewFolder />}
          onClick={onCreateDirectory}
          sx={{
            borderRadius: 1.5,
            px: 2,
          }}
        >
          New Folder
        </Button>
      </Tooltip>

      <Tooltip title="Sort your documents">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "background.paper",
            borderRadius: 1.5,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              px: 1.5,
              height: "100%",
              borderRight: "1px solid",
              borderColor: "divider",
            }}
          >
            <FilterList
              fontSize="small"
              sx={{
                mr: 0.5,
                color: "text.secondary",
              }}
            />
          </Box>
          <DocumentSortControl
            value={sortValue}
            setValue={setSortValue}
          />
        </Box>
      </Tooltip>

      {/* Domain settings button - only shown when viewing a domain */}
      {domainInfo && (
        <Tooltip title="Domain settings">
          <Button
            variant="outlined"
            component={Link}
            href={`/domains/edit/${domainInfo.id}`}
            startIcon={<Settings />}
            sx={{
              borderRadius: 1.5,
              px: 2,
            }}
          >
            Settings
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};

export default BrowserHeader;
