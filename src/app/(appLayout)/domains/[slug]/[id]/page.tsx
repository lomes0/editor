import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DocumentBrowser from "@/components/DocumentBrowser";

// Generate dynamic metadata for the domain directory page
export async function generateMetadata({
  params,
}: {
  params: { slug: string; id: string };
}): Promise<Metadata> {
  const { slug, id } = await params; // Must await params in Next.js dynamic routes

  try {
    console.log("Generating metadata for domain directory:", slug, id);

    // Get domain data for metadata
    const domain = await prisma.domain.findUnique({
      where: { slug },
    });

    if (!domain) {
      console.log("Domain not found for metadata:", slug);
      return {
        title: "Domain Not Found",
      };
    }

    // Try to get directory name
    const directory = await prisma.document.findUnique({
      where: { id },
      select: { name: true },
    });

    const directoryName = directory?.name || "Directory";

    return {
      title: `${directoryName} - ${domain.name} - Editor`,
      description:
        `Browse documents in the ${directoryName} directory in ${domain.name} domain`,
    };
  } catch (error) {
    console.error("Error fetching domain directory metadata:", error);
    return {
      title: "Directory - Editor",
    };
  }
}

export default async function DomainDirectoryPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  // Must await params in Next.js dynamic routes
  const { slug, id } = await params;
  const session = await getServerSession(authOptions);

  try {
    // Get domain to check permissions
    const domain = await prisma.domain.findUnique({
      where: { slug },
    });

    // Domain doesn't exist
    if (!domain) {
      return notFound();
    }

    // Check if user is not the domain owner (domains don't have a private flag, only documents do)
    if (domain.userId !== session?.user?.id) {
      // In the future, you might want to add domain.private check if that field is added to the Domain model
      return notFound();
    }

    // Check if directory exists and belongs to this domain
    const directory = await prisma.document.findFirst({
      where: {
        id,
        domainId: domain.id,
        type: "DIRECTORY",
      },
    });

    if (!directory) {
      return notFound();
    }

    // Render the document browser with the directory id and domain info
    return <DocumentBrowser directoryId={id} domainId={domain.id} domainInfo={domain} />;
  } catch (error) {
    console.error("Error fetching domain directory:", error);
    return notFound();
  }
}
