"use client";
import { useMemo } from "react";
import { DocumentType, UserDocument } from "@/types";

interface UseDocumentFilteringProps {
  documents: UserDocument[];
  directoryId?: string;
  domainId?: string;
}

interface FilteredDocuments {
  directories: UserDocument[];
  regularDocuments: UserDocument[];
  currentDirectory: UserDocument | null;
}

/**
 * Custom hook to efficiently filter and categorize documents
 * Memoized to prevent unnecessary recalculations
 */
export const useDocumentFiltering = ({
  documents,
  directoryId,
  domainId,
}: UseDocumentFilteringProps): FilteredDocuments => {
  return useMemo(() => {
    // Find current directory if browsing a specific directory
    const currentDirectory = directoryId
      ? documents.find((doc) =>
        (doc.local?.id === directoryId || doc.cloud?.id === directoryId) &&
        (doc.local?.type === DocumentType.DIRECTORY ||
          doc.cloud?.type === DocumentType.DIRECTORY)
      ) || null
      : null;

    // Helper function to check if a document is a directory
    const isDirectory = (doc: UserDocument) =>
      doc.local?.type === DocumentType.DIRECTORY ||
      doc.cloud?.type === DocumentType.DIRECTORY;

    // Helper function to check if a document belongs to a domain
    // A document belongs to a domain if:
    // 1. It has the domainId directly, OR
    // 2. It's a descendant of a directory that has the domainId
    const belongsToDomain = (
      doc: UserDocument,
      targetDomainId: string,
    ): boolean => {
      const localDomainId = doc.local?.domainId;
      const cloudDomainId = doc.cloud?.domainId;

      // Check direct domain membership
      if (
        localDomainId === targetDomainId || cloudDomainId === targetDomainId
      ) {
        return true;
      }

      // Check if it's a descendant of a directory with the domainId
      const localParentId = doc.local?.parentId;
      const cloudParentId = doc.cloud?.parentId;
      const parentId = localParentId || cloudParentId;

      if (parentId) {
        const parent = documents.find((d) =>
          d.local?.id === parentId || d.cloud?.id === parentId
        );
        if (parent) {
          return belongsToDomain(parent, targetDomainId);
        }
      }

      return false;
    };

    // Filter items based on context
    const filteredItems = directoryId
      ? documents.filter((doc) => {
        const localParentId = doc.local?.parentId;
        const cloudParentId = doc.cloud?.parentId;

        // For cloud documents with undefined parentId, they can't be children of any directory
        if (doc.cloud && cloudParentId === undefined) {
          return false;
        }

        // Check if this document is a child of the current directory
        const isChild = localParentId === directoryId ||
          cloudParentId === directoryId;

        // If we're in domain context, also check domain membership
        if (domainId && isChild) {
          return belongsToDomain(doc, domainId);
        }

        return isChild;
      })
      : documents.filter((doc) => {
        const localParentId = doc.local?.parentId;
        const cloudParentId = doc.cloud?.parentId;

        if (domainId) {
          // Domain browsing: include documents that belong to this domain
          const documentBelongsToDomain = belongsToDomain(doc, domainId);
          // Only show documents at root level of the domain
          return documentBelongsToDomain && (!localParentId && !cloudParentId);
        } else {
          // Personal documents: exclude domain documents
          const hasDomain = doc.local?.domainId || doc.cloud?.domainId;
          if (hasDomain) return false;

          // Special handling for cloud documents with undefined parentId
          if (doc.cloud && cloudParentId === undefined) {
            const cloudDomainId = doc.cloud?.domainId;
            return !cloudDomainId;
          }

          return (!localParentId && !cloudParentId);
        }
      });

    // Separate directories and documents, removing duplicates
    const processedIds = new Set<string>();
    const directories: UserDocument[] = [];
    const regularDocuments: UserDocument[] = [];

    filteredItems.forEach((doc) => {
      if (processedIds.has(doc.id)) return;
      processedIds.add(doc.id);

      if (isDirectory(doc)) {
        directories.push(doc);
      } else {
        regularDocuments.push(doc);
      }
    });

    return {
      directories,
      regularDocuments,
      currentDirectory,
    };
  }, [documents, directoryId, domainId]);
};
