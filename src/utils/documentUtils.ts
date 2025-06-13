// Server-side utility functions for documents
import { DocumentType } from "@/types";

// Helper function to check if a document is a directory
export function isDirectoryServer(document: any): boolean {
  return document?.type === DocumentType.DIRECTORY || document?.type === "DIRECTORY";
}
