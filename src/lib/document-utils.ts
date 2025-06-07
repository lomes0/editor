import { getCachedRevision } from "@/repositories/revision";
import { findUserDocument } from "@/repositories/document";
import { unstable_cache } from "next/cache";
import { validate } from "uuid";

const PUBLIC_URL = process.env.PUBLIC_URL;

/**
 * Get HTML for a revision
 */
const getRevisionHtml = async (id: string) => {
  try {
    const revision = await getCachedRevision(id);
    if (!revision) return null;
    const data = revision.data;
    const response = await fetch(`${PUBLIC_URL}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    const html = await response.text();
    return html;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Cached version of getRevisionHtml
 */
export const findRevisionHtml = unstable_cache(getRevisionHtml, [], { tags: ["html"] });

/**
 * Get thumbnail HTML for a revision
 */
const getRevisionThumbnail = async (id: string) => {
  try {
    const revision = await getCachedRevision(id);
    if (!revision) return null;
    const data = revision.data;
    const thumbnailData = { ...data, root: { ...data.root, children: data.root.children.slice(0, 3) } };
    const response = await fetch(`${PUBLIC_URL}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thumbnailData),
    });
    if (!response.ok) return null;
    const html = await response.text();
    return html;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Cached version of getRevisionThumbnail
 */
export const findRevisionThumbnail = unstable_cache(getRevisionThumbnail, [], { tags: ["thumbnail"] });

/**
 * Validate a document handle
 */
export const validateHandle = async (handle: string) => {
  if (handle.length < 3) {
    return { title: "Handle is too short", subtitle: "Handle must be at least 3 characters long" };
  }
  if (!/^[a-zA-Z0-9-]+$/.test(handle)) {
    return { title: "Invalid Handle", subtitle: "Handle must only contain letters, numbers, and hyphens" };
  }
  if (validate(handle)) {
    return { title: "Invalid Handle", subtitle: "Handle must not be a UUID" };
  }
  const userDocument = await findUserDocument(handle);
  if (userDocument) {
    return { title: "Handle already in use", subtitle: "Please choose a different handle" };
  }
  return null;
}
