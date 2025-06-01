import type { Metadata } from "next";
import DocumentBrowser from "@/components/DocumentBrowser";

export const metadata: Metadata = {
  title: 'Document Browser',
  description: 'Browse documents and directories'
}

const BrowsePage = () => {
  return <DocumentBrowser />;
};

export default BrowsePage;
