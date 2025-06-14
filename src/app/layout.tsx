import type { Metadata, Viewport } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import ThemeProvider from "@/components/Layout/ThemeProvider";
import "mathlive/static.css";
import "@/editor/theme.css";
import "./globals.css";

const PUBLIC_URL = process.env.PUBLIC_URL;

export const metadata: Metadata = {
  title: "Editor",
  description:
    "Editor is a free text editor, with support for LaTeX, Geogebra, Excalidraw and markdown shortcuts. Create, share and print math documents with ease.",
  applicationName: "Editor",
  appleWebApp: {
    capable: true,
    title: "Editor",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: "/favicon.ico",
  keywords: [
    "Editor",
    "Online Editor",
    "Latex",
    "Geogebra",
    "Excalidraw",
    "Markdown",
  ],
  metadataBase: PUBLIC_URL ? new URL(PUBLIC_URL) : undefined,
  openGraph: {
    title: "Editor",
    description:
      "Editor is a free text editor, with support for LaTeX, Geogebra, Excalidraw and markdown shortcuts. Create, share and print math documents with ease.",
    images: [
      {
        url: "/feature.png",
        width: 1024,
        height: 500,
        alt: "Editor Feature Image",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  colorScheme: "dark light",
  themeColor: [{
    media: "(prefers-color-scheme: light)",
    color: "#ffffff",
  }, {
    media: "(prefers-color-scheme: dark)",
    color: "#121212",
  }],
};

export default function RootLayout(
  { children }: { children: React.ReactNode },
) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
