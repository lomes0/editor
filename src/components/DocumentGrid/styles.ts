import { Theme } from "@mui/material/styles";

/**
 * Styles for the DocumentGrid component
 */
export const documentGridStyles = (theme: Theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    width: "100%",
  },
  grid: {
    width: "100%",
    marginTop: 0,
  },
  gridRow: {
    width: "100%",
    marginTop: 0,
    marginLeft: 0,
  },
  card: {
    transition:
      `transform ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}, 
                box-shadow ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
    height: "100%",
    "&:focus-within": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  },
  skeletonCard: {
    height: "100%",
  },
});

/**
 * Styles for the GridSectionHeader component
 */
export const gridSectionStyles = (theme: Theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.primary.main,
  },
  title: {
    fontWeight: 600,
    fontSize: "1.125rem",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      fontSize: "1rem",
    },
  },
  counter: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.mode === "light"
      ? theme.palette.grey[200]
      : theme.palette.grey[800],
    color: theme.palette.text.secondary,
    borderRadius: "50%",
    width: 24,
    height: 24,
    fontSize: "0.75rem",
    fontWeight: 500,
    marginLeft: theme.spacing(1),
  },
  actionContainer: {
    display: "flex",
    alignItems: "center",
  },
});
