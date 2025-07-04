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
    console.log("Generating metadata for domain document view:", slug, id);

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

    // Check if user is not the domain owner (domains don't have a private flag, only documents do)
    if (domain.userId !== session?.user?.id) {
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
    });

    if (!document) {
      return notFound();
    }

    // Re-use the existing ViewPage component but in the domain context
    return <Page params={{ id }} searchParams={{}} />;
  } catch (error) {
    console.error("Error fetching domain document:", error);
    return notFound();
  }
}
