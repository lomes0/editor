"use client";
import { usePathname, useRouter } from "next/navigation";
import RouterLink from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { actions, useDispatch, useSelector } from "@/store";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ChevronLeft,
  ChevronRight,
  Create,
  Dashboard,
  Folder,
  Help,
  Home,
  LibraryBooks,
} from "@mui/icons-material";
import FileBrowser from "@/components/FileBrowser";
import { styles } from "./styles";

const drawerWidth = 240;

const SideBar: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(!isMobile);
  const initialized = useSelector((state) => state.ui.initialized);
  const user = useSelector((state) => state.user);

  // Determine if we're in edit mode to trigger autosave
  const isEditMode = pathname.startsWith("/edit/");

  // Always show file browser for all routes
  const showFileBrowser = true;

  const toggleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (!initialized) dispatch(actions.load());
  }, [dispatch, initialized]);

  useEffect(() => {
    // Close drawer on mobile when navigating
    if (isMobile) {
      setOpen(false);
    }
  }, [pathname, isMobile]);

  const navigationItems = [
    { text: "Home", icon: <Home />, path: "/" },
    { text: "Browse", icon: <Folder />, path: "/browse" },
    { text: "New Document", icon: <Create />, path: "/new" },
    { text: "Playground", icon: <LibraryBooks />, path: "/playground" },
    { text: "Tutorial", icon: <Help />, path: "/tutorial" },
  ];

  // Custom Link component that handles auto-saving before navigation
  const SafeNavigationLink = ({
    href,
    children,
    onClick,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: any;
  }) => {
    const handleClick = (e: React.MouseEvent) => {
      // Only perform autosave if we're in edit mode
      if (isEditMode) {
        e.preventDefault();

        // Dispatch a special action to trigger autosave
        dispatch({
          type: "TRIGGER_AUTOSAVE_BEFORE_NAVIGATION",
          payload: { targetUrl: href },
        });

        // This will be picked up by the DocumentEditor component
        // after autosave is complete, it will navigate to the target URL

        // After a short delay to allow autosave to start, navigate to the target URL
        setTimeout(() => {
          router.push(href);
          if (onClick) onClick();
        }, 100);
      } else {
        // If not in edit mode, just navigate normally
        if (onClick) onClick();
      }
    };

    return (
      <RouterLink href={href} onClick={handleClick} {...props}>
        {children}
      </RouterLink>
    );
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        width: open ? drawerWidth : 72,
        flexShrink: 0,
        displayPrint: "none",
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : 72,
          boxSizing: "border-box",
          transition: theme.transitions.create(["width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: "hidden",
          overflowY: "hidden", // Changed from default
          display: "flex",
          flexDirection: "column",
          height: "100vh", /* Full viewport height */
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: theme.spacing(1, 1),
          justifyContent: open ? "space-between" : "center",
          flexShrink: 0, // Prevent shrinking
        }}
      >
        {open && (
          <Box
            component={RouterLink}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Image
              src="/logo.svg"
              alt="Editor Logo"
              width={32}
              height={32}
            />
            <Box
              sx={{
                ml: 1,
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              Editor
            </Box>
          </Box>
        )}
        {!open && (
          <Tooltip title="Editor">
            <Box
              component={RouterLink}
              href="/"
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Image
                src="/logo.svg"
                alt="Editor Logo"
                width={32}
                height={32}
              />
            </Box>
          </Tooltip>
        )}
        <IconButton onClick={toggleSidebar}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>

      <Divider sx={styles.divider} />

      {/* Top section - Main navigation */}
      <Box
        sx={{
          ...styles.sectionBox,
          flexShrink: 0, // Prevent this section from shrinking
          pb: 0,
        }}
      >
        <List>
          {navigationItems.map((item) => (
            <ListItem
              key={item.text}
              disablePadding
              sx={{ display: "block" }}
            >
              <Tooltip
                title={open ? "" : item.text}
                placement="right"
              >
                <ListItemButton
                  component={SafeNavigationLink}
                  href={item.path}
                  selected={pathname === item.path ||
                    pathname.startsWith(`${item.path}/`) ||
                    (item.text === "Browse" && pathname.startsWith("/view"))}
                  sx={{
                    minHeight: 42, // Reduced from 48
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    "&.Mui-selected": {
                      bgcolor: "action.selected",
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.15)",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : "auto",
                      justifyContent: "center",
                      "& .MuiSvgIcon-root": {
                        fontSize: "1.2rem", // Smaller icon size
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: "0.9rem", // Smaller text size
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={styles.divider} />

      {/* Middle section - File browser */}
      <Box
        sx={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          minHeight: 0, /* Critical for flexbox to allow child to shrink */
        }}
        className="file-browser-scroll"
      >
        <FileBrowser open={open} />
      </Box>

      <Divider sx={styles.dividerBottom} />

      {/* Bottom section - User */}
      <Box
        sx={{
          ...styles.userBox,
          flexShrink: 0,
        }}
      >
        <Box sx={{ mt: "auto" }}>
          <List>
            <ListItem disablePadding sx={{ display: "block" }}>
              <Tooltip
                title={open ? "" : (user ? user.name : "Sign In")}
                placement="right"
              >
                <ListItemButton
                  component={SafeNavigationLink}
                  href={user ? "/dashboard" : "/api/auth/signin"}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    <Avatar
                      alt={user?.name}
                      src={user?.image ?? undefined}
                      sx={{
                        width: 32,
                        height: 32,
                      }}
                    />
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={user ? user.name : "Sign In"}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SideBar;
