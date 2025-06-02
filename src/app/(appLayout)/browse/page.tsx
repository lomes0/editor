import type { Metadata } from "next";
import DocumentBrowser from "@/components/DocumentBrowser";

export const metadata: Metadata = {
  title: 'Document Library | MathEditor',
  description: 'Browse, organize, and manage your documents and folders'
}

// Use the default export async function pattern
export default async function BrowsePage() {
  return <DocumentBrowser />;
}
