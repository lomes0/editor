import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Page from "@/app/(appLayout)/view/[id]/page";

// Generate dynamic metadata for the domain document view page
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

    // Try to get document name
    const document = await prisma.document.findUnique({
      where: { id },
      select: { name: true },
    });

    const documentName = document?.name || "Document";

    return {
      title: `${documentName} - ${domain.name} - Editor`,
      description: `View document ${documentName} in ${domain.name} domain`,
    };
  } catch (error) {
    console.error("Error fetching domain document metadata:", error);
    return {
      title: "Document - Editor",
    };
  }
}

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

export default async function DomainDocumentViewPage({
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

    // First check if document exists at all
    const documentExists = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        domainId: true,
        type: true,
        authorId: true,
        name: true, // Get the name for display purposes
      },
    });

    if (!documentExists) {
      return notFound();
    }

    // Check if document belongs to this domain by checking its ancestry
    const documentBelongsToDomain = await belongsToDomain(id, domain.id);

    if (!documentBelongsToDomain || documentExists.type !== "DOCUMENT") {
      return notFound();
    }

    // Get the full document data now that we know it belongs to the domain
    const document = await prisma.document.findUnique({
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

    if (!document) {
      return notFound();
    }

    // Check permissions: If document is private, only the domain owner or document author can view it
    if (document.private) {
      const isAuthor = session?.user?.id === document.author.id;
      const isDomainOwner = domain.userId === session?.user?.id;

      if (!isAuthor && !isDomainOwner) {
        return notFound();
      }
    }

    // Re-use the existing ViewPage component but in the domain context
    return <Page params={{ id }} searchParams={{}} />;
  } catch (error) {
    console.error("Error fetching domain document:", error);
    return notFound();
  }
}
