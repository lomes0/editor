"use client";
import { CssBaseline } from "@mui/material";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// Create a stable theme with deterministic class names
const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: { colorSchemeSelector: "media" },
  components: {
    // Override default container sizes
    MuiContainer: {
      styleOverrides: {
        maxWidthXl: {
          maxWidth: "2400px !important", // Override the default 'xl' size of 1536px
        },
      },
    },
  },
});

// Options for the emotion cache
const cacheOptions = {
  key: "mui-app",
  prepend: true,
  stylisPlugins: [], // Ensure consistent behavior between server and client
};

export default function ThemeProvider(
  { children }: { children: React.ReactNode },
) {
  return (
    <AppRouterCacheProvider options={cacheOptions}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}
