import { getPublicBlogPosts } from './blog';

export async function generateRssFeed() {
  const posts = await getPublicBlogPosts();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const date = new Date().toUTCString();
  
  // Create RSS feed content
  const rssContent = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Math Editor Blog</title>
  <link>${baseUrl}/blog</link>
  <description>Latest posts from the Math Editor blog</description>
  <language>en</language>
  <lastBuildDate>${date}</lastBuildDate>
  <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
  ${posts.map(post => `
  <item>
    <title>${escapeXml(post.name)}</title>
    <link>${baseUrl}/blog/${post.handle}</link>
    <guid>${baseUrl}/blog/${post.handle}</guid>
    <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
  </item>
  `).join('')}
</channel>
</rss>`;

  return rssContent;
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
