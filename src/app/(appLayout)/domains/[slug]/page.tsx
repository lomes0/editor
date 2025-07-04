import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DomainView from "@/components/Domain/DomainView";

// Generate dynamic metadata for the domain page
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await params; // Must await params in Next.js dynamic routes

  try {
    console.log("Generating metadata for domain:", slug);

    // Don't check authentication here - just get domain data for metadata
    const domain = await prisma.domain.findUnique({
      where: { slug },
    });

    if (!domain) {
      console.log("Domain not found for metadata:", slug);
      return {
        title: "Domain Not Found",
      };
    }

    return {
      title: `${domain.name} - Editor`,
      description: domain.description ||
        `Documents in the ${domain.name} domain`,
    };
  } catch (error) {
    console.error("Error fetching domain metadata:", error);
    return {
      title: "Domain - Editor",
    };
  }
}

export default async function DomainPage({
  params,
}: {
  params: { slug: string };
}) {
  // Must await params in Next.js dynamic routes
  const { slug } = await params;

  try {
    // Get the session but don't fail if not available
    // Let the client-side handle auth redirects
    const session = await getServerSession(authOptions);

    // Add some debug logging
    console.log("Domain page rendering with slug:", slug);
    console.log(
      "Session status:",
      session ? "authenticated" : "unauthenticated",
    );

    // Note: We're intentionally NOT returning early if there's no session
    // Instead, we'll pass the domain data to the client component
    // which will handle auth and redirects appropriately

    // Fetch domain information regardless of session status
    console.log("Fetching domain with slug:", slug);

    const domain = await prisma.domain.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            handle: true,
          },
        },
      },
    });

    if (!domain) {
      console.log("Domain not found for slug:", slug);
      return (
        <div className="py-10 text-center">
          <h1 className="text-2xl font-bold mb-4">Domain Not Found</h1>
          <p className="mb-6">
            The domain you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <a
            href="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Return Home
          </a>
        </div>
      );
    }

    console.log("Domain found:", domain.name);

    // If we have a session, we can check ownership server-side
    // Otherwise, we'll let the client-side component handle it
    if (session?.user) {
      console.log("User is authenticated:", session.user.id);

      // Only do the ownership check if we have a session
      if (domain.userId !== session.user.id) {
        console.log(
          "User doesn't have access to this domain - server side check",
        );
        return (
          <div className="py-10 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">
              You don't have permission to view this domain.
            </p>
            <a
              href="/"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Return Home
            </a>
          </div>
        );
      }
    } else {
      console.log("No session, letting client handle authentication");
      // We'll still render the domain view - client will handle auth
    }

    // Fetch documents in this domain
    console.log("Fetching documents for domain:", domain.id);

    let documents: any[] = [];
    try {
      documents = await prisma.document.findMany({
        where: {
          domainId: domain.id,
          // Only include top-level documents (no parent)
          parentId: null,
        },
        orderBy: [
          // Sort directories first, then documents
          { type: "asc" },
          // Use sort_order if available, otherwise sort by name
          { sort_order: { sort: "asc", nulls: "last" } },
          { name: "asc" },
        ],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              handle: true,
            },
          },
          // Include children count for directories
          _count: {
            select: {
              children: true,
            },
          },
        },
      });

      console.log(`Found ${documents.length} documents in domain`);
    } catch (docError) {
      console.error("Error fetching documents:", docError);
      // Continue with empty documents list
    }

    // Always render the DomainView, even without a session
    // This allows hydration to work properly and client-side auth to take over
    return (
      <DomainView
        domain={domain}
        documents={documents}
        currentUser={session?.user || domain.user}
      />
    );
  } catch (error) {
    console.error("Error loading domain page:", error);
    // Return a more user-friendly error page instead of notFound()
    return (
      <div className="py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Something Went Wrong</h1>
        <p className="mb-6">
          We encountered an error while loading this domain.
        </p>
        <p className="text-gray-500 mb-6">
          Error details: {(error as Error).message || "Unknown error"}
        </p>
        <a
          href="/"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Return Home
        </a>
      </div>
    );
  }
}
