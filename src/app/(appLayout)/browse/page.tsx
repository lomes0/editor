import type { Metadata } from "next";
import DocumentBrowser from "@/components/DocumentBrowser";

export const metadata: Metadata = {
  title: 'Document Browser',
  description: 'Browse documents and directories'
}

// Use the default export async function pattern
export default async function BrowsePage() {
  return <DocumentBrowser />;
}
