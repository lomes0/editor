"use client";
import StoreProvider from "@/store/StoreProvider";
import SideBar from "./SideBar";
import DocumentInfoDrawerArrow from "./DocumentInfoDrawerArrow";
import ScrollTop from "./ScrollTop";
import AlertDialog from "./Alert";
import Announcer from "./Announcer";
import ProgressBar from "./ProgressBar";
import HydrationManager from "./HydrationManager";
import Footer from "@/components/Home/Footer";
import { Box, Container, Toolbar, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Suspense } from "react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const sidebarWidth = isMobile ? 0 : 72; // Collapsed sidebar width

  return (
    <>
      <Suspense>
        <ProgressBar />
      </Suspense>
      <StoreProvider>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          <SideBar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: { sm: `calc(100% - ${sidebarWidth}px)` },
              ml: { sm: `${sidebarWidth}px` },
              overflow: "auto", /* Allow scrolling but scrollbar is hidden by CSS */
              transition: theme.transitions.create([
                "margin",
                "width",
              ], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Toolbar
              id="back-to-top-anchor"
              sx={{
                displayPrint: "none",
                minHeight: "0 !important",
              }}
            />
            <HydrationManager>
              <Container
                className="editor-container"
                id="editor-main-container"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  mx: "auto", /* Reset to center horizontally */
                  my: 2,
                  flex: 1,
                  position: "relative",
                  overflow: "auto", /* Allow scrolling but scrollbar is hidden by CSS */
                  maxWidth: {
                    xs: "100% !important",
                    sm: "100% !important",
                    md: "1800px !important",
                  },
                  px: {
                    xs: 1,
                    sm: 1,
                  }, /* Reduced horizontal padding */
                }}
              >
                {children}
              </Container>
            </HydrationManager>
          </Box>
          <ScrollTop />
        </Box>
        <Footer />
        <AlertDialog />
        <Announcer />
        <DocumentInfoDrawerArrow />
      </StoreProvider>
    </>
  );
};

export default AppLayout;
