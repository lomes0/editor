"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface UseDocumentNavigationProps {
  directoryId?: string;
  domainId?: string;
}

/**
 * Custom hook for document navigation actions
 * Encapsulates URL construction logic and provides consistent navigation
 */
export const useDocumentNavigation = (
  { directoryId, domainId }: UseDocumentNavigationProps,
) => {
  const router = useRouter();

  const createDocument = useCallback(() => {
    let url = "/new";
    const params = new URLSearchParams();

    if (directoryId) {
      params.append("parentId", directoryId);
    }

    if (domainId) {
      params.append("domain", domainId);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    router.push(url);
  }, [router, directoryId, domainId]);

  const createDirectory = useCallback(() => {
    let url = "/new-directory";
    const params = new URLSearchParams();

    if (directoryId) {
      url += `/${directoryId}`;
    }

    if (domainId) {
      params.append("domain", domainId);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    router.push(url);
  }, [router, directoryId, domainId]);

  return {
    createDocument,
    createDirectory,
  };
};
