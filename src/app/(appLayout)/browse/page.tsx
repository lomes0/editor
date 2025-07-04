import type { Metadata } from "next";
import DocumentBrowser from "@/components/DocumentBrowser";

export const metadata: Metadata = {
  title: "Personal Documents | Editor",
  description:
    "Browse, organize, and manage your personal documents and folders outside of domains",
};

// Use the default export async function pattern
export default async function BrowsePage() {
  return <DocumentBrowser />;
}
