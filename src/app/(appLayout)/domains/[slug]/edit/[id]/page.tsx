import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EditDocument from "@/components/EditDocument";

// Generate dynamic metadata for the domain document edit page
export async function generateMetadata({
  params,
}: {
  params: { slug: string; id: string };
}): Promise<Metadata> {
  const { slug, id } = await params; // Must await params in Next.js dynamic routes

  try {
    console.log("Generating metadata for domain document edit:", slug, id);

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

    // Check if document exists and belongs to this domain
    const document = await prisma.document.findFirst({
      where: {
        id,
        domainId: domain.id,
        type: "DOCUMENT",
      },
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
