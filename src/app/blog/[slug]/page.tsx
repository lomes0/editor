import { notFound } from 'next/navigation';
import { getPublicBlogSlugs, getPublicBlogBySlug } from '@/lib/blog';
import { renderLexicalToHtml } from '@/lib/lexicalRender';

// Generate static params for all public blog posts
export async function generateStaticParams() {
  const slugs = await getPublicBlogSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

// Optionally, generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPublicBlogBySlug(slug);
  if (!post) return {};
  return {
    title: post.name,
    // No summary field, so omit description
  };
}

// Enable ISR with a reasonable revalidation period
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate at most once per hour

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPublicBlogBySlug(slug);
  if (!post) return notFound();

  // Defensive: check for post.head (latest revision id)
  if (!post.head) {
    return (
      <main className="prose mx-auto py-8">
        <h1>{post.name}</h1>
        <p>No content available.</p>
      </main>
    );
  }

  // Fetch the latest revision for the document
  const { prisma } = await import('@/lib/prisma');
  const revision = await prisma.revision.findFirst({
    where: { documentId: post.id, id: post.head },
  });
  
  if (!revision) {
    return (
      <main className="prose mx-auto py-8">
        <h1>{post.name}</h1>
        <p>No content available.</p>
        <div className="text-gray-500 mt-4">
          <p>Last updated: {new Date(post.updatedAt).toLocaleString()}</p>
        </div>
      </main>
    );
  }

  // Convert Lexical JSON to HTML
  let html = '';
  try {
    // Defensive: check for valid JSON
    if (!revision.data || typeof revision.data !== 'object') {
      throw new Error('Invalid Lexical data');
    }
    // Patch global.document for SSR if needed
    if (typeof document === 'undefined') {
      const { parseHTML } = await import('linkedom');
      const dom = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
      global.document = dom.document;
      global.DocumentFragment = dom.DocumentFragment;
      global.Element = dom.Element;
    }
    html = await renderLexicalToHtml(revision.data);
  } catch (e) {
    html = `<div class="bg-red-50 border border-red-200 text-red-800 rounded p-4 my-4">
      <h3>Error rendering content</h3>
      <pre class="text-sm">${String(e)}</pre>
    </div>`;
  }

  return (
    <main className="prose mx-auto py-8">
      <article>
        <header>
          <h1>{post.name}</h1>
          <div className="text-gray-500 mb-6">
            <time dateTime={post.createdAt.toISOString()}>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </header>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  );
}
