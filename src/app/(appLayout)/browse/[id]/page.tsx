import type { Metadata } from "next";
import DocumentBrowser from "@/components/DocumentBrowser";

export const metadata: Metadata = {
  title: 'Folder Contents | MathEditor',
  description: 'Browse and manage documents and folders in this directory'
}

// Define the page component props
type Props = {
  params: Promise<{
    id: string;
  }> | {
    id: string;
  }
}

// Make the component async and properly handle params
export default async function DirectoryPage({ params }: Props) {
  // In Next.js 13+, params may be a Promise that needs to be awaited
  const resolvedParams = await Promise.resolve(params);
  return <DocumentBrowser directoryId={resolvedParams.id} />;
}
