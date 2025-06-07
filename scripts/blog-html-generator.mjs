// Script to convert Lexical JSON to HTML using the project's existing renderer
import { renderLexicalToHtml } from './lexical-render-util.mjs';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Initialize Prisma client
const prisma = new PrismaClient();

// Helper function to escape HTML
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function generateBlogPosts() {
  try {
    // Fetch all public blog posts with their content
    const posts = await prisma.document.findMany({
      where: { published: true, private: false, type: 'DOCUMENT' },
      select: {
        handle: true,
        name: true,
        createdAt: true,
        head: true,
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${posts.length} posts to export`);
    
    // Ensure the blog posts directory exists
    const blogDir = path.join(process.cwd(), 'blog-static-export', 'blog');
    fs.mkdirSync(blogDir, { recursive: true });
    
    // Get latest revisions for each document
    for (const post of posts) {
      try {
        // Get the revision content
        const revision = await prisma.revision.findUnique({
          where: { id: post.head },
          select: { data: true }
        });
        
        if (!revision || !revision.data) {
          console.warn(`No revision found for post: ${post.name}`);
          continue;
        }
        
        // Convert Lexical JSON to HTML using the project's existing renderer
        const contentHtml = await renderLexicalToHtml(revision.data);
        
        // Create a directory for the post
        const postDir = path.join(blogDir, post.handle);
        fs.mkdirSync(postDir, { recursive: true });
        
        // Generate HTML file
        const postDate = new Date(post.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const postHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(post.name)} - Math Editor Blog</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        /* Base styles */
        body { font-family: system-ui, -apple-system, sans-serif; }
        .math-content img { max-width: 100%; height: auto; }
        .math-content { overflow-x: auto; }
        .math-content pre { background-color: #f5f5f5; padding: 1rem; border-radius: 0.25rem; overflow-x: auto; }
        .math-content table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
        .math-content th, .math-content td { border: 1px solid #e2e8f0; padding: 0.5rem; }
        .math-content th { background-color: #f8fafc; }
        
        /* Heading styles */
        h1, h2, h3, h4, h5, h6 { margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600; line-height: 1.25; }
        h1 { font-size: 2.25rem; }
        h2 { font-size: 1.875rem; }
        h3 { font-size: 1.5rem; }
        h4 { font-size: 1.25rem; }
        h5 { font-size: 1.125rem; }
        h6 { font-size: 1rem; }
        
        /* Text formatting */
        p { margin-bottom: 1rem; line-height: 1.6; }
        strong, b { font-weight: 700; }
        em, i { font-style: italic; }
        code { font-family: monospace; background-color: #f5f5f5; padding: 0.1rem 0.2rem; border-radius: 0.2rem; font-size: 0.9em; }
        pre { margin: 1rem 0; }
        a { color: #2563eb; text-decoration: underline; }
        a:hover { color: #1d4ed8; }
        
        /* Lists */
        ul, ol { margin-bottom: 1rem; padding-left: 2rem; }
        ul { list-style-type: disc; }
        ol { list-style-type: decimal; }
        li { margin-bottom: 0.5rem; }
        
        /* Blockquote */
        blockquote { border-left: 4px solid #e2e8f0; padding-left: 1rem; margin-left: 0; margin-right: 0; font-style: italic; }
        
        /* Math */
        .math-inline, .math-display { font-family: 'Latin Modern Math', serif; }
        .math-display { display: block; text-align: center; margin: 1rem 0; overflow-x: auto; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="max-w-4xl mx-auto py-12 px-4">
        <header class="mb-6">
            <div class="mb-8">
                <a href="../index.html" class="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to blog
                </a>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">${escapeHtml(post.name)}</h1>
            <div class="flex items-center gap-2 text-gray-600 mb-6">
                <span>${postDate}</span>
                <span>•</span>
                <span>By ${escapeHtml(post.author?.name || 'Unknown')}</span>
            </div>
        </header>
        
        <main>
            <article class="prose prose-lg max-w-none bg-white rounded-lg shadow p-8 math-content">
                ${contentHtml}
            </article>
        </main>
        
        <footer class="mt-12 pt-6 border-t border-gray-200 text-gray-600">
            <p>© 2025 Math Editor</p>
        </footer>
    </div>
</body>
</html>`;
        
        // Write the HTML file
        fs.writeFileSync(path.join(postDir, 'index.html'), postHtml);
        console.log(`Generated post: ${post.handle}`);
      } catch (error) {
        console.error(`Error generating post ${post.name}:`, error);
      }
    }
    
    console.log('Blog posts generated successfully');
  } catch (error) {
    console.error('Error generating blog posts:', error);
    process.exit(1);
  } finally {
    // Close Prisma connection
    await prisma.$disconnect();
  }
}

// Execute the function
generateBlogPosts();
