"use client";
import { CssBaseline } from "@mui/material";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import EmotionCache from "./EmotionCache";
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

export default function ThemeProvider(
  { children }: { children: React.ReactNode },
) {
  return (
    <EmotionCache>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </EmotionCache>
  );
}
