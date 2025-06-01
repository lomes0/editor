import type { Metadata } from "next";
import DirectoryBrowser from "@/components/DirectoryBrowser";

export const metadata: Metadata = {
  title: 'Directory',
  description: 'Browse directory contents'
}

interface DirectoryPageProps {
  params: {
    id: string;
  }
}

const DirectoryPage = ({ params }: DirectoryPageProps) => {
  return <DirectoryBrowser directoryId={params.id} />;
};

export default DirectoryPage;
