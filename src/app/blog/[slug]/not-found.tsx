import Link from 'next/link';

export default function BlogPostNotFound() {
  return (
    <main className="prose mx-auto py-8">
      <h1>Post Not Found</h1>
      <p>Sorry, the blog post you're looking for doesn't exist or has been removed.</p>
      <Link href="/blog" className="text-blue-600 hover:underline">
        Return to Blog Index
      </Link>
    </main>
  );
}
