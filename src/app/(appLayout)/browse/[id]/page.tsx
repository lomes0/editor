import type { Metadata } from "next";
import DirectoryBrowser from "@/components/DirectoryBrowser";

export const metadata: Metadata = {
  title: 'Directory',
  description: 'Browse directory contents'
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
  return <DirectoryBrowser directoryId={resolvedParams.id} />;
}
