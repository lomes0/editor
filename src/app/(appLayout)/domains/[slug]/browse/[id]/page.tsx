import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DocumentBrowser from "@/components/DocumentBrowser";

// Helper function to check if a document belongs to a domain
async function belongsToDomain(
  documentId: string,
  domainId: string,
): Promise<boolean> {
  // Get the document with its parent chain
  let currentDocumentId: string | null = documentId;

  while (currentDocumentId) {
    const doc: { domainId: string | null; parentId: string | null } | null =
      await prisma.document.findUnique({
        where: { id: currentDocumentId },
        select: { domainId: true, parentId: true },
      });

    if (!doc) {
      return false;
    }

    // If this document has the domainId, it belongs to the domain
    if (doc.domainId === domainId) {
      return true;
    }

    // Move to parent document
    currentDocumentId = doc.parentId;
  }

  return false;
}

// Generate dynamic metadata for the domain directory page
export async function generateMetadata({
  params,
}: {
  params: { slug: string; id: string };
}): Promise<Metadata> {
  const { slug, id } = await params; // Must await params in Next.js dynamic routes

  try {
    // Get domain data for metadata
    const domain = await prisma.domain.findUnique({
      where: { slug },
    });

    if (!domain) {
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

    // First check if directory exists at all
    const directoryExists = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        domainId: true,
        type: true,
        authorId: true,
        name: true, // Get the name for display purposes
      },
    });

    if (!directoryExists) {
      return notFound();
    }

    // Check if directory belongs to this domain by checking its ancestry
    const directoryBelongsToDomain = await belongsToDomain(id, domain.id);

    if (!directoryBelongsToDomain || directoryExists.type !== "DIRECTORY") {
      return notFound();
    }

    // Get the full directory data now that we know it belongs to the domain
    const directory = await prisma.document.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!directory) {
      return notFound();
    }

    // Check permissions: If directory is private, only the domain owner or directory author can view it
    if (directory.private) {
      const isAuthor = session?.user?.id === directory.author.id;
      const isDomainOwner = domain.userId === session?.user?.id;

      if (!isAuthor && !isDomainOwner) {
        return notFound();
      }
    }

    // Render the document browser with the directory id and domain info
    return (
      <DocumentBrowser
        directoryId={id}
        domainId={domain.id}
        domainInfo={domain}
      />
    );
  } catch (error) {
    console.error("Error fetching domain directory:", error);
    return notFound();
  }
}
