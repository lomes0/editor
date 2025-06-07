import { prisma } from '@/lib/prisma';

// Fetch all slugs for public blog posts
export async function getPublicBlogSlugs(): Promise<string[]> {
  const docs = await prisma.document.findMany({
    where: { published: true, private: false, type: 'DOCUMENT' },
    select: { handle: true },
  });
  return docs.map(doc => doc.handle).filter((h): h is string => !!h);
}

// Fetch a single public blog post by slug (handle)
export async function getPublicBlogBySlug(handle: string) {
  return prisma.document.findFirst({
    where: { handle, published: true, private: false, type: 'DOCUMENT' },
  });
}

// Fetch all public blog posts (for index page)
export async function getPublicBlogPosts() {
  // Use 'handle' as slug, 'name' as title, and no summary field
  return prisma.document.findMany({
    where: { published: true, private: false, type: 'DOCUMENT' },
    select: { handle: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}
