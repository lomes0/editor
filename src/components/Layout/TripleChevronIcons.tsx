"use client";
import { SvgIcon, SvgIconProps } from "@mui/material";

// Triple arrow icon pointing to the left
export const TripleChevronLeft: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M18.41 7.41L17 6l-6 6 6 6 1.41-1.41L13.83 12l4.58-4.59z" />
      <path d="M13.41 7.41L12 6l-6 6 6 6 1.41-1.41L8.83 12l4.58-4.59z" />
      <path d="M8.41 7.41L7 6l-6 6 6 6 1.41-1.41L3.83 12l4.58-4.59z" />
    </SvgIcon>
  );
};

// Triple arrow icon pointing to the right
export const TripleChevronRight: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M5.59 7.41L7 6l6 6-6 6-1.41-1.41L10.17 12 5.59 7.41z" />
      <path d="M10.59 7.41L12 6l6 6-6 6-1.41-1.41L15.17 12 10.59 7.41z" />
      <path d="M15.59 7.41L17 6l6 6-6 6-1.41-1.41L20.17 12 15.59 7.41z" />
    </SvgIcon>
  );
};
