import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EditDocument from "@/components/EditDocument";

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

// Generate dynamic metadata for the domain document edit page
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
      console.log("Domain not found for metadata:", slug);
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
      title: `Edit ${documentName} - ${domain.name} - Editor`,
      description: `Edit document ${documentName} in ${domain.name} domain`,
    };
  } catch (error) {
    console.error("Error fetching domain document metadata:", error);
    return {
      title: "Edit Document - Editor",
    };
  }
}

export default async function DomainDocumentEditPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  // Must await params in Next.js dynamic routes
  const { slug, id } = await params;
  const session = await getServerSession(authOptions);

  // Must be authenticated to edit
  if (!session?.user) {
    return notFound();
  }

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
    if (domain.userId !== session.user.id) {
      // In the future, you might want to add domain.private check if that field is added to the Domain model
      return notFound();
    }

    // First check if document exists
    const documentExists = await prisma.document.findUnique({
      where: { id },
      select: { id: true, type: true },
    });

    if (!documentExists || documentExists.type !== "DOCUMENT") {
      return notFound();
    }

    // Check if document belongs to this domain by checking its ancestry
    const documentBelongsToDomain = await belongsToDomain(id, domain.id);

    if (!documentBelongsToDomain) {
      return notFound();
    }

    // Get the full document data now that we know it belongs to the domain
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        coauthors: true,
      },
    });

    if (!document) {
      return notFound();
    }

    // Check if user has edit permission (author or domain owner)
    const canEdit = document.authorId === session.user.id ||
      domain.userId === session.user.id ||
      document.coauthors.some((ca) => ca.userEmail === session.user.email);

    if (!canEdit) {
      return notFound();
    }

    // Return the EditDocument component directly
    return <EditDocument>{id}</EditDocument>;
  } catch (error) {
    console.error("Error fetching domain document for editing:", error);
    return notFound();
  }
}
