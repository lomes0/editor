import Link from 'next/link';
import { getPublicBlogPosts } from '@/lib/blog';

// These ensure proper static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate at most once per hour

export default async function BlogIndexPage() {
  const posts = await getPublicBlogPosts();

  return (
    <main className="prose mx-auto py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="m-0">Blog</h1>
        <Link 
          href="/blog/rss.xml" 
          className="text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="6.18" cy="17.82" r="2.18"/>
            <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
          </svg>
          RSS Feed
        </Link>
      </header>
      
      {posts.length === 0 ? (
        <p>No posts available yet.</p>
      ) : (
        <ul className="list-none p-0">
          {posts.map((post: any) => (
            <li key={post.handle} className="mb-6 border-b pb-4 last:border-b-0">
              <h2 className="m-0 mb-2">
                <Link href={`/blog/${post.handle}`} className="no-underline hover:underline">
                  {post.name}
                </Link>
              </h2>
              <div className="text-gray-500 text-sm">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
