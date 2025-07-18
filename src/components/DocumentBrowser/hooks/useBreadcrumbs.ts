"use client";
import { useMemo } from "react";
import { UserDocument } from "@/types";

interface BreadcrumbItem {
  id: string;
  name: string;
}

/**
 * Custom hook to build breadcrumb navigation efficiently
 * Memoized to prevent unnecessary recalculations
 */
export const useBreadcrumbs = (
  directoryId: string | undefined,
  documents: UserDocument[],
): BreadcrumbItem[] => {
  return useMemo(() => {
    if (!directoryId) return [];

    const buildBreadcrumbs = (
      docId: string,
      trail: BreadcrumbItem[] = [],
    ): BreadcrumbItem[] => {
      const doc = documents.find((d) =>
        d.local?.id === docId || d.cloud?.id === docId
      );

      if (!doc) return trail;

      const name = doc.local?.name || doc.cloud?.name || "";
      const parentId = doc.local?.parentId || doc.cloud?.parentId;

      const newTrail = [{ id: docId, name }, ...trail];

      if (parentId) {
        return buildBreadcrumbs(parentId, newTrail);
      }

      return newTrail;
    };

    return buildBreadcrumbs(directoryId);
  }, [directoryId, documents]);
};
