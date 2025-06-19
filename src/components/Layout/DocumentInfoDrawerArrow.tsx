"use client";
import { actions, useDispatch, useSelector } from "@/store";
import { Box, Tooltip, Paper } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { alpha } from "@mui/material/styles";

const DocumentInfoDrawerArrow: React.FC = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const drawerOpen = useSelector((state) => state.ui.drawer);
  
  // Only show the arrow in edit or view modes
  const showArrow = !!["/edit", "/view"].find((path) =>
    pathname.startsWith(path)
  );

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const arrowRef = useRef<HTMLDivElement>(null);

  const toggleDrawer = () => {
    dispatch(actions.toggleDrawer());
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dragDistance = startX - e.clientX;
        // If dragged more than 50px to the left, open the drawer
        if (dragDistance > 50 && !drawerOpen) {
          toggleDrawer();
          setIsDragging(false);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const dragDistance = startX - e.touches[0].clientX;
        // If dragged more than 50px to the left, open the drawer
        if (dragDistance > 50 && !drawerOpen) {
          toggleDrawer();
          setIsDragging(false);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, drawerOpen, startX]);

  if (!showArrow) {
    return null;
  }

  return (
    <Tooltip title="Drag to open Document Info" placement="left">
      <Paper
        ref={arrowRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={toggleDrawer}
        elevation={3}
        sx={{
          position: "fixed",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
          zIndex: 1200,
          cursor: "pointer",
          height: 80,
          width: 24,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: (theme) => 
            drawerOpen 
              ? alpha(theme.palette.primary.main, 0.9)
              : alpha(theme.palette.background.paper, 0.9),
          transition: (theme) => theme.transitions.create(
            ["background-color"], 
            { duration: theme.transitions.duration.shorter }
          ),
          "&:hover": {
            backgroundColor: (theme) => 
              drawerOpen
                ? alpha(theme.palette.primary.dark, 0.9)
                : alpha(theme.palette.action.hover, 0.9),
          },
          displayPrint: "none",
        }}
        aria-label="document info"
      >
        <ChevronLeft 
          sx={{ 
            color: (theme) => drawerOpen ? theme.palette.primary.contrastText : theme.palette.text.primary,
            transform: drawerOpen ? "rotate(180deg)" : "none",
            transition: (theme) => theme.transitions.create(
              ["transform"], 
              { duration: theme.transitions.duration.standard }
            ),
          }} 
        />
      </Paper>
    </Tooltip>
  );
};

export default DocumentInfoDrawerArrow;
