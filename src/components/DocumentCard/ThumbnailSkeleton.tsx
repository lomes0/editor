import { Box, Skeleton } from "@mui/material";

const ThumbnailSkeleton = () => {
  return (
    <Box
      className="document-thumbnail"
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Skeleton
        variant="text"
        width="60%"
        height={32}
        sx={{ alignSelf: "center" }}
      />
      <Skeleton
        variant="text"
        width="45%"
        height={18}
        sx={{ alignSelf: "start", my: 0.8 }}
      />
      <Skeleton
        variant="text"
        width="65%"
        height={18}
        sx={{ alignSelf: "start", my: 0.8 }}
      />
      <Skeleton
        variant="text"
        width="50%"
        height={18}
        sx={{ alignSelf: "start", my: 0.8 }}
      />
      <Skeleton
        variant="rectangular"
        width="100%"
        height={80}
        sx={{ alignSelf: "center", my: 1.5 }}
      />
    </Box>
  );
};

export default ThumbnailSkeleton;
