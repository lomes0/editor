# Hydration Error Troubleshooting

If you encounter hydration mismatch errors when running the application, follow these steps to resolve them:

## Common Causes of Hydration Errors

1. **CSS-in-JS Inconsistency**: Differences in class names generated on the server vs. client.
2. **Random values**: Using `Math.random()`, `Date.now()`, or other non-deterministic functions.
3. **Browser-specific code**: Using `typeof window !== 'undefined'` checks in components.
4. **Date formatting**: Different date formatting between server and client.

## Quick Fix

Run the following command to clean the cache and rebuild the application:

```bash
npm run rebuild
```

## Advanced Troubleshooting

If problems persist:

1. Check components wrapped with `<HydrationManager>` - this component delays rendering until after hydration is complete.
2. Ensure all components with dynamic content that might differ between server and client are using `suppressHydrationWarning` or are wrapped in the `HydrationManager`.
3. For MUI components specifically, make sure they're properly wrapped in the ThemeProvider and using the proper emotion cache setup.

## Implementation Details

The application uses a specific setup to avoid hydration issues:

- Single emotion cache configuration with consistent settings:
  ```tsx
  const cacheOptions = {
    key: "mui-app",
    prepend: true, 
    stylisPlugins: [] // Ensure consistent behavior between server and client
  };
  ```
- Deterministic class name generation by setting `realContentHash: false` in webpack config
- Server-side rendering with consistent environment variables
- HydrationManager component for components with potential mismatches
- TerserPlugin configured to preserve class names:
  ```typescript
  {
    keep_classnames: true,
    keep_fnames: true
  }
  ```

## Recent Fixes (June 2025)

- Fixed emotion cache configuration to ensure consistent CSS class generation between server and client
- Removed duplicate cache providers - now using only AppRouterCacheProvider from MUI
- Added TypeScript type annotations for webpack plugins to avoid build errors
- Set `realContentHash: false` in webpack optimization to ensure consistent class names
