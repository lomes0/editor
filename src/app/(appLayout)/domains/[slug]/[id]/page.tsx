import { redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

// This route is deprecated. Redirect to the new browse route.
// Generate dynamic metadata for the deprecated domain directory page
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
  // This route is deprecated. Redirect to the new browse route.
  const { slug, id } = await params;

  console.log(
    "Redirecting from deprecated route:",
    `/domains/${slug}/${id}`,
    "to:",
    `/domains/${slug}/browse/${id}`,
  );

  // Redirect to the new browse route
  redirect(`/domains/${slug}/browse/${id}`);
}
