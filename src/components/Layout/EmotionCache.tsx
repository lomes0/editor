"use client";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { useState } from "react";
import { CacheProvider as EmotionCacheProvider } from "@emotion/react";

// Create a stable cache configuration with deterministic class names
const createEmotionCache = () => {
  return createCache({
    key: "mui-app",
    prepend: true,
    stylisPlugins: [], // Ensure consistent behavior between server and client
  });
};

// This component is adapted from the MUI with Next.js example
// https://github.com/mui/material-ui/blob/master/examples/material-ui-nextjs-ts/src/components/ThemeRegistry/EmotionCache.tsx
export default function EmotionCache(
  { children }: { children: React.ReactNode },
) {
  const [{ cache, flush }] = useState(() => {
    const cache = createEmotionCache();
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key="emotion-server-side"
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <EmotionCacheProvider value={cache}>{children}</EmotionCacheProvider>;
}
