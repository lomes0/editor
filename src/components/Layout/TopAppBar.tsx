"use client";
import { usePathname } from "next/navigation";
import RouterLink from "next/link";
import { useEffect } from "react";
import Image from "next/image";
import { actions, useDispatch, useSelector } from "@/store";
import {
  AppBar,
  Avatar,
  Box,
  Fab,
  IconButton,
  Link,
  Toolbar,
  Typography,
  useScrollTrigger,
  Zoom,
} from "@mui/material";
import { Info, KeyboardArrowUp } from "@mui/icons-material";

function ScrollTop() {
  const trigger = useScrollTrigger({ disableHysteresis: true });

  const handleClick = () => {
    const anchor = document.querySelector("#back-to-top-anchor");
    if (anchor) {
      anchor.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Fab
        color="secondary"
        size="small"
        aria-label="scroll back to top"
        onClick={handleClick}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          displayPrint: "none",
          transition: "bottom 0.3s",
          "@media (max-width: 496px)": {
            "&:has(~.editor-container .editor-toolbar #text-format-toggles)": {
              bottom: 48,
            },
          },
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Zoom>
  );
}

const TopAppBar: React.FC = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const showDrawerButton = !!["/edit", "/view"].find((path) =>
    pathname.startsWith(path)
  );
  const initialized = useSelector((state) => state.ui.initialized);
  const user = useSelector((state) => state.user);

  const toggleDrawer = () => {
    dispatch(actions.toggleDrawer());
  };

  const handleResize = () => {
    const keyboardInsetHeight = window.innerHeight -
      (window.visualViewport?.height || window.innerHeight);
    document.documentElement.style.setProperty(
      "--keyboard-inset-height",
      `${keyboardInsetHeight}px`,
    );
  };

  useEffect(() => {
    if (!initialized) dispatch(actions.load());
    if (!window.visualViewport) return;
    window.visualViewport.addEventListener("resize", handleResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <AppBar sx={{ displayPrint: "none" }}>
        <Toolbar id="app-toolbar">
          <Link
            component={RouterLink}
            prefetch={false}
            href="/"
            sx={{ textDecoration: "none" }}
          >
            <Box sx={{ display: "flex" }}>
              <Image
                src="/logo.svg"
                alt="Logo"
                width={32}
                height={32}
              />
              <Typography
                variant="h6"
                component="h1"
                sx={{ marginInlineStart: 2, color: "white" }}
              >
                Math Editor
              </Typography>
            </Box>
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            component={RouterLink}
            prefetch={false}
            href="/browse"
            aria-label="Document Browser"
          >
            <Avatar
              alt={user?.name}
              src={user?.image ?? undefined}
              sx={{ width: 30, height: 30 }}
            />
          </IconButton>
          {showDrawerButton && (
            <IconButton
              id="document-info"
              aria-label="Document Info"
              color="inherit"
              onClick={toggleDrawer}
              sx={{
                "& >.MuiBadge-root": {
                  height: "1em",
                  userSelect: "none",
                  zIndex: -1,
                },
              }}
            >
              <Info />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar id="back-to-top-anchor" sx={{ displayPrint: "none" }} />
      <ScrollTop />
    </>
  );
};

export default TopAppBar;
