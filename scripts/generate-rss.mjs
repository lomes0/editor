// Script to generate RSS feed for the blog
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

async function generateRssFeed() {
  try {
    // Fetch all public blog posts
    const posts = await prisma.document.findMany({
      where: { published: true, private: false, type: 'DOCUMENT' },
      select: { handle: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

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

    // Ensure directory exists
    const rssDir = path.join(process.cwd(), 'blog-static-export', 'blog');
    fs.mkdirSync(rssDir, { recursive: true });
    
    // Write RSS file
    fs.writeFileSync(path.join(rssDir, 'rss.xml'), rssContent);
    console.log('RSS feed generated successfully');
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    process.exit(1);
  } finally {
    // Close Prisma connection
    await prisma.$disconnect();
  }
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
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

// Execute the function
generateRssFeed();
