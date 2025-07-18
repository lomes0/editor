"use client";
import { useCallback, useEffect, useState } from "react";
import { actions, type RootState, useDispatch, useSelector } from "@/store";
import type { Domain, User } from "@/types";

interface DomainManagementState {
  isLoading: boolean;
  error: string | null;
  attemptedLoad: boolean;
}

interface UseDomainManagementProps {
  currentDomainSlug: string | null;
  user: User | null;
}

interface UseDomainManagementReturn {
  domains: Domain[];
  isLoading: boolean;
  error: string | null;
  retryLoad: () => void;
}

/**
 * Custom hook to manage domain loading and state
 * Consolidates domain loading logic and provides better error handling
 */
export const useDomainManagement = ({
  currentDomainSlug,
  user,
}: UseDomainManagementProps): UseDomainManagementReturn => {
  const dispatch = useDispatch();
  const domains = useSelector((state: RootState) => state.domains);

  const [state, setState] = useState<DomainManagementState>({
    isLoading: false,
    error: null,
    attemptedLoad: false,
  });

  const loadDomains = useCallback(async () => {
    if (!user) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await dispatch(actions.fetchUserDomains()).unwrap();
    } catch (error) {
      console.error("Failed to load domains:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to load domains. Please try again.";

      setState((prev) => ({ ...prev, error: errorMessage }));

      // Show user-friendly error notification
      dispatch(actions.announce({
        message: {
          title: "Unable to load domains",
          subtitle: "Please check your connection and try again.",
        },
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false, attemptedLoad: true }));
    }
  }, [dispatch, user]);

  const retryLoad = useCallback(() => {
    setState((prev) => ({ ...prev, attemptedLoad: false }));
    loadDomains();
  }, [loadDomains]);

  // Load domains when needed
  useEffect(() => {
    if (!user) {
      setState((prev) => ({ ...prev, attemptedLoad: false }));
      return;
    }

    const shouldLoadDomains = domains.length === 0 && !state.attemptedLoad;
    const shouldRefreshForMissingDomain = currentDomainSlug &&
      domains.length > 0 &&
      !domains.some((d: Domain) => d.slug === currentDomainSlug) &&
      !state.isLoading;

    if (shouldLoadDomains || shouldRefreshForMissingDomain) {
      if (shouldRefreshForMissingDomain) {
        console.log(
          `Domain ${currentDomainSlug} not found in loaded domains, refreshing...`,
        );
      }
      loadDomains();
    }
  }, [
    currentDomainSlug,
    domains,
    user,
    state.attemptedLoad,
    state.isLoading,
    loadDomains,
  ]);

  return {
    domains,
    isLoading: state.isLoading,
    error: state.error,
    retryLoad,
  };
};
