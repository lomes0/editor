"use client";
import React from "react";
import { Breadcrumbs, Typography } from "@mui/material";
import { Folder, LibraryBooks, Storage } from "@mui/icons-material";
import Link from "next/link";

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BrowserBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
  domainInfo?: any;
  directoryId?: string;
}

/**
 * Breadcrumb navigation component for the document browser
 * Handles both personal and domain document navigation
 */
const BrowserBreadcrumbs: React.FC<BrowserBreadcrumbsProps> = ({
  breadcrumbs,
  domainInfo,
  directoryId,
}) => {
  const hrefPrefix = domainInfo ? `/domains/${domainInfo.slug}` : `/browse`;

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {/* Root breadcrumb */}
      {domainInfo
        ? (
          <Link
            href={`/domains/${domainInfo.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              color: directoryId ? "inherit" : "text.primary",
              textDecoration: "none",
              fontWeight: directoryId ? "normal" : "medium",
            }}
          >
            <LibraryBooks sx={{ mr: 0.5 }} fontSize="inherit" />
            {domainInfo.name}
          </Link>
        )
        : (
          <Link
            href="/browse"
            style={{
              display: "flex",
              alignItems: "center",
              color: directoryId ? "inherit" : "text.primary",
              textDecoration: "none",
              fontWeight: directoryId ? "normal" : "medium",
            }}
          >
            <Storage sx={{ mr: 0.5 }} fontSize="inherit" />
            Personal Documents
          </Link>
        )}

      {/* Directory breadcrumbs */}
      {directoryId && breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        if (isLast) {
          return (
            <Typography
              key={crumb.id}
              color="text.primary"
              sx={{
                display: "flex",
                alignItems: "center",
                fontWeight: "medium",
              }}
            >
              <Folder sx={{ mr: 0.5 }} fontSize="inherit" />
              {crumb.name}
            </Typography>
          );
        }

        return (
          <Link
            key={crumb.id}
            href={`${hrefPrefix}/${crumb.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Folder sx={{ mr: 0.5 }} fontSize="inherit" />
            {crumb.name}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default BrowserBreadcrumbs;
