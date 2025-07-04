/**
 * String utility functions
 */

/**
 * Converts a string to a URL-friendly slug
 * - Converts to lowercase
 * - Removes special characters
 * - Replaces spaces with hyphens
 * - Removes leading and trailing hyphens
 * - Removes consecutive hyphens
 *
 * @param input The string to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(input: string): string {
  if (!input) return "";

  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Trim hyphens from start of text
    .replace(/-+$/, ""); // Trim hyphens from end of text
}

/**
 * Truncates a string to the specified length
 *
 * @param input The string to truncate
 * @param maxLength The maximum length
 * @param addEllipsis Whether to add ellipsis (...) when truncating
 * @returns The truncated string
 */
export function truncateString(
  input: string,
  maxLength: number,
  addEllipsis = true,
): string {
  if (!input || input.length <= maxLength) return input;

  const truncated = input.slice(0, maxLength);
  return addEllipsis ? `${truncated}...` : truncated;
}
