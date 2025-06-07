// Script to generate static HTML files for individual blog posts
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

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
        
        const contentHtml = renderLexicalToHtml(revision.data, post.name);
        
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
        .math-content img { max-width: 100%; height: auto; }
        .math-content { overflow-x: auto; }
        .math-content pre { background-color: #f5f5f5; padding: 1rem; border-radius: 0.25rem; overflow-x: auto; }
        .math-content table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
        .math-content th, .math-content td { border: 1px solid #e2e8f0; padding: 0.5rem; }
        .math-content th { background-color: #f8fafc; }
        /* Add styling for math elements */
        .math-inline, .math-display { font-family: 'Latin Modern Math', serif; }
        .math-display { display: block; text-align: center; margin: 1rem 0; }
        /* Styling for headings */
        h1, h2, h3, h4, h5, h6 { margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600; }
        h1 { font-size: 2.25rem; }
        h2 { font-size: 1.875rem; }
        h3 { font-size: 1.5rem; }
        h4 { font-size: 1.25rem; }
        h5 { font-size: 1.125rem; }
        h6 { font-size: 1rem; }
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

// Helper function to extract preview text from Lexical data
function getPreviewFromLexicalData(data) {
  try {
    // Extract text content from Lexical JSON format
    if (typeof data !== 'object') {
      return '<p>No content available</p>';
    }
    
    const lexicalData = data;
    
    // If the root has children, try to extract text
    if (lexicalData.root && Array.isArray(lexicalData.root.children)) {
      let htmlContent = '';
      
      // Process top-level nodes
      for (const node of lexicalData.root.children) {
        if (node.type === 'paragraph') {
          htmlContent += '<p>';
          if (Array.isArray(node.children)) {
            for (const child of node.children) {
              if (child.type === 'text') {
                htmlContent += escapeHtml(child.text || '');
              } else if (child.type === 'linebreak') {
                htmlContent += '<br>';
              } else if (child.type && child.text) {
                htmlContent += escapeHtml(child.text || '');
              }
            }
          }
          htmlContent += '</p>';
        } else if (node.type === 'heading') {
          const level = node.tag || 'h2';
          htmlContent += `<${level}>`;
          if (Array.isArray(node.children)) {
            for (const child of node.children) {
              if (child.type === 'text') {
                htmlContent += escapeHtml(child.text || '');
              }
            }
          }
          htmlContent += `</${level}>`;
        }
      }
      
      return htmlContent || '<p>Content could not be rendered</p>';
    }
    
    return '<p>No parseable content found</p>';
  } catch (error) {
    console.error('Error parsing Lexical data:', error);
    return '<p>Error rendering content</p>';
  }
}

// Improved Lexical HTML renderer
function renderLexicalToHtml(data, title) {
  try {
    if (!data || typeof data !== 'object' || !data.root || !data.root.children) {
      return `<h1>${escapeHtml(title || 'Untitled')}</h1><p>No content available</p>`;
    }

    const { root } = data;
    let html = '';
    
    // Process each node in the Lexical structure
    for (const node of root.children) {
      html += renderNode(node);
    }
    
    return html || `<p>Content could not be rendered</p>`;
  } catch (error) {
    console.error('Error rendering Lexical data:', error);
    return `<p>Error rendering content: ${error.message}</p>`;
  }
}

// Render a node based on its type
function renderNode(node) {
  if (!node || !node.type) return '';
  
  switch (node.type) {
    case 'paragraph':
      return renderParagraph(node);
    case 'heading':
      return renderHeading(node);
    case 'list':
      return renderList(node);
    case 'listitem':
      return renderListItem(node);
    case 'quote':
      return renderQuote(node);
    case 'code':
      return renderCode(node);
    case 'image':
      return renderImage(node);
    case 'horizontalrule':
      return '<hr />';
    case 'equation':
      return renderEquation(node);
    default:
      return `<div class="unknown-node">${node.type ? `Unknown node type: ${node.type}` : 'Unknown node'}</div>`;
  }
}

// Render paragraph
function renderParagraph(node) {
  if (!node.children || node.children.length === 0) {
    return '<p></p>';
  }
  
  const content = node.children.map(child => renderTextNode(child)).join('');
  return `<p>${content}</p>`;
}

// Render heading
function renderHeading(node) {
  if (!node.children || node.children.length === 0) {
    return `<h${node.tag}></h${node.tag}>`;
  }
  
  const tag = node.tag || '2';  
  const content = node.children.map(child => renderTextNode(child)).join('');
  return `<h${tag}>${content}</h${tag}>`;
}

// Render list
function renderList(node) {
  if (!node.children || node.children.length === 0) {
    return node.listType === 'bullet' ? '<ul></ul>' : '<ol></ol>';
  }
  
  const listItems = node.children.map(item => renderNode(item)).join('');
  
  return node.listType === 'bullet' 
    ? `<ul>${listItems}</ul>` 
    : `<ol>${listItems}</ol>`;
}

// Render list item
function renderListItem(node) {
  if (!node.children || node.children.length === 0) {
    return '<li></li>';
  }
  
  const content = node.children.map(child => renderNode(child)).join('');
  return `<li>${content}</li>`;
}

// Render block quote
function renderQuote(node) {
  if (!node.children || node.children.length === 0) {
    return '<blockquote></blockquote>';
  }
  
  const content = node.children.map(child => renderNode(child)).join('');
  return `<blockquote>${content}</blockquote>`;
}

// Render code block
function renderCode(node) {
  const language = escapeHtml(node.language || '');
  const code = escapeHtml(node.code || '');
  
  return `<pre class="language-${language}"><code>${code}</code></pre>`;
}

// Render image
function renderImage(node) {
  const alt = escapeHtml(node.altText || '');
  const src = escapeHtml(node.src || '');
  const width = node.width ? ` width="${node.width}"` : '';
  const height = node.height ? ` height="${node.height}"` : '';
  
  return `<figure>
    <img src="${src}" alt="${alt}"${width}${height} />
    ${node.caption ? `<figcaption>${escapeHtml(node.caption)}</figcaption>` : ''}
  </figure>`;
}

// Render equation
function renderEquation(node) {
  const equationText = escapeHtml(node.equation || '');
  const className = node.inline ? 'math-inline' : 'math-display';
  
  return `<div class="${className}">${equationText}</div>`;
}

// Render text nodes with formatting
function renderTextNode(node) {
  if (!node) return '';
  
  // For plain string nodes
  if (typeof node === 'string') return escapeHtml(node);
  
  // For text nodes
  if (node.type === 'text') {
    let text = escapeHtml(node.text || '');
    
    // Apply formatting if present
    if (node.format) {
      if (node.format & 1) text = `<strong>${text}</strong>`; // Bold
      if (node.format & 2) text = `<em>${text}</em>`; // Italic
      if (node.format & 4) text = `<u>${text}</u>`; // Underline
      if (node.format & 8) text = `<s>${text}</s>`; // Strikethrough
      if (node.format & 16) text = `<code>${text}</code>`; // Code
      if (node.format & 32) text = `<sub>${text}</sub>`; // Subscript
      if (node.format & 64) text = `<sup>${text}</sup>`; // Superscript
    }
    
    return text;
  }
  
  // For links
  if (node.type === 'link') {
    const url = escapeHtml(node.url || '#');
    const content = node.children?.map(child => renderTextNode(child)).join('') || '';
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${content}</a>`;
  }
  
  // For line breaks
  if (node.type === 'linebreak') {
    return '<br />';
  }
  
  // Fall back to recursively rendering unknown nodes
  if (node.children) {
    return node.children.map(child => renderTextNode(child)).join('');
  }
  
  return '';
}

// Execute the function
generateBlogPosts();
