// Enhanced blog post generator with improved Lexical rendering
import { renderLexicalToHtml } from './improved-lexical-renderer.mjs';
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

// Main function to generate blog posts
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
            name: true,
            handle: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${posts.length} posts to export`);
    
    // Ensure the blog posts directory exists
    const blogDir = path.join(process.cwd(), 'blog-static-export', 'blog');
    fs.mkdirSync(blogDir, { recursive: true });
    
    // Generate an array to collect all post metadata for the index page
    const allPosts = [];
    
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
        
        // Format the post date
        const postDate = new Date(post.createdAt);
        const formattedDate = postDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Add to the posts collection for the index page
        allPosts.push({
          handle: post.handle,
          title: post.name,
          date: formattedDate,
          author: post.author?.name || 'Unknown',
          authorHandle: post.author?.handle,
          timestamp: postDate.getTime()
        });
        
        // Convert Lexical JSON to HTML using our improved renderer
        console.log(`Rendering HTML for post: ${post.name}`);
        const contentHtml = await renderLexicalToHtml(revision.data);
        
        // Create a directory for the post
        const postDir = path.join(blogDir, post.handle);
        fs.mkdirSync(postDir, { recursive: true });
        
        // Generate HTML file
        const postHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(post.name)} - Math Editor Blog</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        /* Base styles */
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
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
        
        /* Code blocks */
        .code-block { background-color: #f5f5f5; padding: 1rem; border-radius: 0.25rem; font-family: monospace; }
        
        /* Blog-specific classes */
        .blog-paragraph { margin-bottom: 1rem; }
        .blog-text-bold { font-weight: bold; }
        .blog-text-italic { font-style: italic; }
        .blog-text-underline { text-decoration: underline; }
        .blog-text-code { font-family: monospace; background-color: #f5f5f5; padding: 0.1rem 0.2rem; border-radius: 0.2rem; }
        .blog-h1, .blog-h2, .blog-h3, .blog-h4, .blog-h5 { font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; }
        .blog-h1 { font-size: 2.25rem; }
        .blog-h2 { font-size: 1.875rem; }
        .blog-h3 { font-size: 1.5rem; }
        .blog-h4 { font-size: 1.25rem; }
        .blog-h5 { font-size: 1.125rem; }
        .blog-link { color: #2563eb; text-decoration: underline; }
        .blog-image { max-width: 100%; height: auto; margin: 1rem 0; }
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
                <span>${formattedDate}</span>
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
    
    // Generate the index page with all posts
    generateIndexPage(blogDir, allPosts);
    
    console.log('Blog posts generated successfully');
  } catch (error) {
    console.error('Error generating blog posts:', error);
    process.exit(1);
  } finally {
    // Close Prisma connection
    await prisma.$disconnect();
  }
}

// Function to generate the index page listing all posts
function generateIndexPage(blogDir, posts) {
  // Sort posts by date (newest first)
  posts.sort((a, b) => b.timestamp - a.timestamp);
  
  // Generate the HTML for the posts list
  let postsHtml = '';
  for (const post of posts) {
    postsHtml += `
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        <a href="./${post.handle}/" class="hover:text-blue-600">${escapeHtml(post.title)}</a>
      </h2>
      <div class="flex items-center gap-2 text-gray-600">
        <span>${post.date}</span>
        <span>•</span>
        <span>By ${escapeHtml(post.author)}</span>
      </div>
      <div class="mt-4">
        <a href="./${post.handle}/" class="text-blue-600 hover:text-blue-800 font-medium">
          Read post →
        </a>
      </div>
    </div>`;
  }
  
  // Generate the full HTML for the index page
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Math Editor Blog</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="max-w-4xl mx-auto py-12 px-4">
        <header class="mb-12 text-center">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Math Editor Blog</h1>
            <p class="text-xl text-gray-600">Explore math, education, and technology</p>
        </header>
        
        <main>
            <div class="space-y-6">
                ${postsHtml || '<p class="text-center text-gray-600">No posts available yet.</p>'}
            </div>
        </main>
        
        <footer class="mt-12 pt-6 border-t border-gray-200 text-center text-gray-600">
            <p>© 2025 Math Editor</p>
        </footer>
    </div>
</body>
</html>`;
  
  // Write the index page
  fs.writeFileSync(path.join(blogDir, 'index.html'), indexHtml);
  console.log('Generated index page');
}

// Execute the function
generateBlogPosts();
