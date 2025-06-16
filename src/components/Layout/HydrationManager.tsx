"use client";
import { useEffect, useState } from "react";

/**
 * HydrationManager is a utility component that helps avoid hydration mismatches
 * by ensuring the component only renders after hydration is complete.
 * This can be used to wrap components that might cause hydration mismatches due to
 * random values, date formatting, or other client-specific rendering.
 */
export default function HydrationManager(
  { children }: { children: React.ReactNode },
) {
  // Track whether we're in the browser or server
  const [isHydrated, setIsHydrated] = useState(false);

  // After the component mounts, mark it as hydrated
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // On the server and during hydration, render a simple div
  // with suppressHydrationWarning to prevent hydration errors
  if (!isHydrated) {
    return (
      <div suppressHydrationWarning style={{ visibility: "hidden" }}>
        Loading...
      </div>
    );
  }

  // Once the client has hydrated, render the children
  return <>{children}</>;
}
