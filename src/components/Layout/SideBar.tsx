"use client"
import { usePathname, useRouter } from 'next/navigation';
import RouterLink from 'next/link'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useDispatch, actions, useSelector } from '@/store';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Avatar, 
  Divider, 
  Tooltip, 
  useTheme, 
  useMediaQuery
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  Dashboard, 
  Folder, 
  Home, 
  Info, 
  Print, 
  Create, 
  Settings, 
  Help,
  LibraryBooks
} from '@mui/icons-material';
import FileBrowser from '@/components/FileBrowser';

const drawerWidth = 240;

const SideBar: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [open, setOpen] = useState(!isMobile);
  const initialized = useSelector(state => state.ui.initialized);
  const user = useSelector(state => state.user);
  
  const showPrintButton = !!['/edit', '/view', '/playground'].find(path => pathname.startsWith(path));
  const showInfoButton = !!['/edit', '/view'].find(path => pathname.startsWith(path));
  const showFileBrowser = pathname.startsWith('/browse');

  const handlePrint = () => { window.print(); }
  const toggleDrawer = () => { dispatch(actions.toggleDrawer()); }
  const toggleSidebar = () => { setOpen(!open); }

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
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Browse', icon: <Folder />, path: '/browse' },
    { text: 'New Document', icon: <Create />, path: '/new' },
    { text: 'Playground', icon: <LibraryBooks />, path: '/playground' },
    { text: 'Tutorial', icon: <Help />, path: '/tutorial' }
  ];

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        width: open ? drawerWidth : 72,
        flexShrink: 0,
        displayPrint: "none",
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 72,
          boxSizing: 'border-box',
          transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: theme.spacing(1, 1), 
        justifyContent: open ? 'space-between' : 'center' 
      }}>
        {open && (
          <Box component={RouterLink} href="/" sx={{ 
            display: "flex", 
            alignItems: "center", 
            textDecoration: "none", 
            color: "inherit" 
          }}>
            <Image src="/logo.svg" alt="Editor Logo" width={32} height={32} />
            <Box sx={{ ml: 1, fontWeight: 'bold', fontSize: '1.2rem' }}>Editor</Box>
          </Box>
        )}
        {!open && (
          <Tooltip title="Editor">
            <Box component={RouterLink} href="/" sx={{ display: "flex", justifyContent: "center" }}>
              <Image src="/logo.svg" alt="Editor Logo" width={32} height={32} />
            </Box>
          </Tooltip>
        )}
        <IconButton onClick={toggleSidebar}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>
      
      <Divider />
      
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={open ? "" : item.text} placement="right">
              <ListItemButton
                component={RouterLink}
                href={item.path}
                selected={pathname === item.path || pathname.startsWith(`${item.path}/`)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        {showPrintButton && (
          <ListItem disablePadding sx={{ display: 'block' }}>
            <Tooltip title={open ? "" : "Print"} placement="right">
              <ListItemButton
                onClick={handlePrint}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <Print />
                </ListItemIcon>
                {open && <ListItemText primary="Print" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        )}
        
        {showInfoButton && (
          <ListItem disablePadding sx={{ display: 'block' }}>
            <Tooltip title={open ? "" : "Document Info"} placement="right">
              <ListItemButton
                id="document-info"
                onClick={toggleDrawer}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '& >.MuiBadge-root': { 
                    height: '1em', 
                    userSelect: 'none', 
                    zIndex: -1 
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <Info />
                </ListItemIcon>
                {open && <ListItemText primary="Document Info" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        )}
      </List>
      
      {showFileBrowser && (
        <Box sx={{ mt: 1 }}>
          <FileBrowser open={open} />
        </Box>
      )}
      
      <Box sx={{ flexGrow: 1 }} />
      
      <List>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <Tooltip title={open ? "" : (user ? user.name : "Sign In")} placement="right">
            <ListItemButton
              component={RouterLink}
              href={user ? "/browse" : "/api/auth/signin"}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <Avatar 
                  alt={user?.name} 
                  src={user?.image ?? undefined} 
                  sx={{ 
                    width: 32, 
                    height: 32 
                  }} 
                />
              </ListItemIcon>
              {open && <ListItemText primary={user ? user.name : "Sign In"} />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default SideBar;
