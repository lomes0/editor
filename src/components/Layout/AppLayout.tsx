"use client";
import StoreProvider from "@/store/StoreProvider";
import SideBar from './SideBar';
import ScrollTop from './ScrollTop';
import AlertDialog from "./Alert";
import Announcer from "./Announcer";
import ProgressBar from "./ProgressBar";
import { Box, Container, Toolbar, useTheme, useMediaQuery } from "@mui/material";
import { Suspense } from "react";

const AppLayout = ({ children }: { children: React.ReactNode; }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const sidebarWidth = isMobile ? 0 : 72; // Collapsed sidebar width

  return (
    <>
      <Suspense>
        <ProgressBar />
      </Suspense>
      <StoreProvider>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <SideBar />
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              width: { sm: `calc(100% - ${sidebarWidth}px)` },
              ml: { sm: `${sidebarWidth}px` },
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Toolbar id="back-to-top-anchor" sx={{ displayPrint: "none", minHeight: '0 !important' }} />
            <Container
              className='editor-container'
              sx={{
                display: 'flex',
                flexDirection: 'column',
                mx: 'auto', /* Reset to center horizontally */
                my: 2,
                flex: 1,
                position: 'relative',
                maxWidth: {
                  xs: '100% !important',
                  sm: '100% !important',
                  md: '1400px !important',
                },
                px: { xs: 1, sm: 1 } /* Reduced horizontal padding */
              }}>
              {children}
            </Container>
          </Box>
          <ScrollTop />
        </Box>
        <AlertDialog />
        <Announcer />
      </StoreProvider>
    </>
  );
};

export default AppLayout;
