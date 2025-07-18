"use client";
import { Fab } from "@mui/material";
import { Edit } from "@mui/icons-material";
import Link from "next/link";
import { FloatingActionButton } from "./FloatingActionsContainer";

interface EditDocumentButtonProps {
  handle: string;
}

const EditDocumentButton: React.FC<EditDocumentButtonProps> = ({ handle }) => {
  return (
    <FloatingActionButton id="document-edit" priority={20}>
      <Fab
        size="medium"
        component={Link}
        href={`/edit/${handle}`}
        sx={{
          displayPrint: "none",
        }}
        aria-label="Edit document"
      >
        <Edit />
      </Fab>
    </FloatingActionButton>
  );
};

export default EditDocumentButton;
