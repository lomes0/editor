/**
 * Metadata for Open Graph image generation
 */
export interface OgMetadata {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  user?: {
    name: string;
    image: string;
    email: string;
  };
}
