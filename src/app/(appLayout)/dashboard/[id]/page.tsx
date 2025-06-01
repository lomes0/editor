import type { Metadata } from "next";
import DirectoryView from "@/components/DirectoryView";

export const metadata: Metadata = {
  title: 'Directory',
  description: 'View contents of a directory'
}

interface DirectoryPageProps {
  params: Promise<{
    id: string;
  }> | {
    id: string;
  }
}

const DirectoryPage = async ({ params }: DirectoryPageProps) => {
  // In Next.js 13+, params may be a Promise that needs to be awaited
  const resolvedParams = await Promise.resolve(params);
  return <DirectoryView directoryId={resolvedParams.id} />;
};

export default DirectoryPage;
