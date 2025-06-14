"use client"
import * as React from 'react';
import { memo } from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import { Card, CardActionArea, CardHeader, CardActions } from '@mui/material';
import RouterLink from 'next/link';
import { User, UserDocument } from '@/types';

const BaseCard: React.FC<{
  userDocument?: UserDocument,
  user?: User,
  sx?: SxProps<Theme>,
  href: string,
  title: React.ReactNode,
  subheader: React.ReactNode,
  avatar: React.ReactNode,
  actions: React.ReactNode
}> = memo(({ userDocument, user, sx, href, title, subheader, avatar, actions }) => {
  return (
    <Card 
      variant="outlined" 
      className="document-card"
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between", 
        height: "100%", 
        minHeight: "200px", 
        maxWidth: "100%", 
        position: "relative",
        borderRadius: "8px",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderColor: "primary.light",
          transform: "translateY(-2px)"
        },
        ...sx 
      }}
    >
      <CardActionArea 
        component={RouterLink} 
        prefetch={false} 
        href={href} 
        sx={{ 
          flexGrow: 1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "transparent" // Remove default hover background
          }
        }}
      />
      <div style={{ position: "relative", zIndex: 2, pointerEvents: "none" }}>
        <CardHeader 
          sx={{ 
            alignItems: "start", 
            px: 2.5,
            pt: 2.5,
            pb: 1.5,
            '& .MuiCardHeader-content': { 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis",
              ml: 0.5
            },
            '& .MuiCardHeader-title': { 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis",
              fontSize: "1.05rem",
              fontWeight: 500,
              letterSpacing: "0.01em",
              color: "text.primary"
            }
          }}
          title={title}
          subheader={subheader}
          avatar={avatar}
        />
      </div>
      <CardActions 
        sx={{ 
          height: 50, 
          minHeight: 50,
          px: 2,
          py: 1,
          backgroundColor: "rgba(0,0,0,0.01)",
          borderTop: "1px solid",
          borderColor: "divider",
          "& button:first-of-type": { ml: "auto !important" }, 
          '& .MuiChip-root:last-of-type': { mr: 1 },
          position: "relative", 
          zIndex: 2,
          pointerEvents: "auto"
        }}
      >
        {actions}
      </CardActions>
    </Card>
  );
});

export default BaseCard;