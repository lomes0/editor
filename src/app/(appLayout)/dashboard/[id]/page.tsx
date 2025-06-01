import type { Metadata } from "next";
import DirectoryView from "@/components/DirectoryView";

export const metadata: Metadata = {
  title: 'Directory',
  description: 'View contents of a directory'
}

interface DirectoryPageProps {
  params: {
    id: string;
  }
}

const DirectoryPage = ({ params }: DirectoryPageProps) => {
  return <DirectoryView directoryId={params.id} />;
};

export default DirectoryPage;
