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
  Category,
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
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const initialized = useSelector((state) => state.ui.initialized);
  const user = useSelector((state) => state.user);
  const domains = useSelector((state) => state.domains);

  // Determine if we're in edit mode to trigger autosave
  const isEditMode = pathname.startsWith("/edit/");

  // Show file browser for all routes except /browse routes
  const showFileBrowser = !pathname.startsWith("/browse");

  // Helper function to extract slug from domain routes
  const extractDomainSlug = (path: string) => {
    if (path.startsWith("/domains/")) {
      const parts = path.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const slug = parts[1]; // "domains" is at index 0, slug is at index 1

        // Skip the "new" and "edit" special routes
        if (slug === "new" || slug === "edit") {
          return null;
        }

        return slug;
      }
    }
    return null;
  };

  // Extract domain ID from the pathname if we're in a domain route
  const currentDomainId = (() => {
    const slug = extractDomainSlug(pathname);
    if (slug) {
      // Find the domain with this slug
      const domain = domains.find((d) => d.slug === slug);

      // If domains are loaded and we found a matching domain, return its ID
      if (domain?.id) {
        return domain.id;
      }
    }
    return null;
  })();

  const toggleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (!initialized) dispatch(actions.load());
  }, [dispatch, initialized]);

  // Listen for domain route changes to load domain data when needed
  useEffect(() => {
    const slug = extractDomainSlug(pathname);
    if (slug && domains.length > 0) {
      // Check if this domain exists in our loaded domains
      const domainExists = domains.some((d) => d.slug === slug);

      // If we're on a domain route but the domain isn't found, try refreshing the domains
      if (!domainExists && user && !isLoading) {
        console.log(
          `Domain ${slug} not found in loaded domains, refreshing...`,
        );
        setIsLoading(true);

        dispatch(actions.fetchUserDomains())
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, [pathname, domains, user, dispatch, isLoading]);

  // Track if we've attempted to load domains to avoid infinite loops
  const [attemptedDomainLoad, setAttemptedDomainLoad] = useState(false);

  // Reset attempted domain load when user changes
  useEffect(() => {
    setAttemptedDomainLoad(false);
  }, [user]);

  // Ensure we have domains loaded
  useEffect(() => {
    // Check if we need to load domains
    const needToLoadDomains = domains.length === 0 && user &&
      !attemptedDomainLoad;

    if (needToLoadDomains) {
      console.log("Loading domains in SideBar");
      setAttemptedDomainLoad(true);
      setIsLoading(true);

      dispatch(actions.fetchUserDomains())
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [domains.length, user, dispatch, attemptedDomainLoad]);

  useEffect(() => {
    // Close drawer on mobile when navigating
    if (isMobile) {
      setOpen(false);
    }
  }, [pathname, isMobile]);

  // Define the interface for navigation items
  interface NavigationItem {
    text: string;
    icon: React.ReactNode;
    path: string;
    isDomain?: boolean;
    slug?: string;
    id?: string;
  }

  const navigationItems: NavigationItem[] = [
    { text: "Home", icon: <Home />, path: "/" },
    { text: "Browse", icon: <Folder />, path: "/browse" },
    { text: "New Domain", icon: <LibraryBooks />, path: "/domains/new" },
  ];

  // Add domains to navigation items
  const domainItems = domains.map((domain) => ({
    text: domain.name.charAt(0).toUpperCase() + domain.name.slice(1), // Capitalize first letter
    icon: (
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: "#555", // Dark gray instead of black
        }}
      />
    ),
    path: `/domains/${domain.slug}`,
    isDomain: true,
    slug: domain.slug,
    id: domain.id,
  }));

  // Main navigation items only (without domains)
  const allNavigationItems: NavigationItem[] = [
    ...navigationItems,
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
          {allNavigationItems.map((item) => (
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
                  selected={Boolean(
                    pathname === item.path ||
                      pathname.startsWith(`${item.path}/`) ||
                      (item.text === "Browse" && pathname.startsWith("/view")),
                  )}
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

      {/* Domain section */}
      {domains.length > 0 && (
        <Box
          sx={{
            ...styles.sectionBox,
            flexShrink: 0,
            pb: 0,
          }}
        >
          {open && (
            <Box
              sx={{
                px: 2,
                py: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  color: "text.secondary",
                }}
              >
                DOMAINS
              </Box>
            </Box>
          )}
          <List>
            {domainItems.map((item) => (
              <ListItem
                key={item.id}
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
                    selected={Boolean(
                      pathname === item.path ||
                        (item.slug &&
                          pathname.startsWith(`/domains/${item.slug}/`)),
                    )}
                    sx={{
                      minHeight: 36, // Reduced from 42 to make items more compact
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      py: 0.58, // Add less vertical padding
                      "&.Mui-selected": {
                        bgcolor: "action.selected",
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.15)",
                        },
                      },
                    }}
                  >
                    {!open && (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: item.id && domains.find((d) =>
                                d.id === item.id
                              )?.color || "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          color: "white",
                        }}
                      >
                        {item.text.charAt(0)}
                      </Box>
                    )}
                    {open && (
                      <>
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: 1.5, // Reduced margin to make more compact
                            ml: 0.5,
                            width: 10,
                            justifyContent: "center",
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: "0.85rem", // Smaller text for more compactness
                            margin: 0,
                          }}
                        />
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Divider sx={styles.divider} />

      {/* Middle section - File browser */}
      {showFileBrowser && (
        <>
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
            <FileBrowser open={open} domainId={currentDomainId} />
          </Box>

          <Divider sx={styles.dividerBottom} />
        </>
      )}
      {!showFileBrowser && (
        <>
          <Box
            sx={{
              flex: "1 1 auto",
              minHeight: 0,
            }}
          />
          <Divider sx={styles.dividerBottom} />
        </>
      )}

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
