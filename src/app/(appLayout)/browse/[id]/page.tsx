import type { Metadata } from "next";
import DirectoryBrowser from "@/components/DirectoryBrowser";

export const metadata: Metadata = {
  title: 'Directory',
  description: 'Browse directory contents'
}

// Define the page component props
type Props = {
  params: {
    id: string;
  }
}

// Make the component async and properly handle params
export default async function DirectoryPage({ params }: Props) {
  // In Next.js, we should use the params directly in async components
  return <DirectoryBrowser directoryId={params.id} />;
}
