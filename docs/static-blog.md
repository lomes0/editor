# Static Blog Feature

The Math Editor application now supports static blog generation, allowing you to publish and distribute public documents as a static blog that can be hosted anywhere.

## How It Works

1. Documents in the database that are marked as `published: true` and `private: false` are eligible for inclusion in the static blog.
2. The blog generation process fetches eligible documents from the database and generates static HTML files.
3. Lexical editor content is properly rendered to HTML using a custom renderer with JSDom support.
4. The rendered HTML pages are saved to the `blog-static-export` directory, ready for deployment to any static hosting service.

## Architecture

### Data Flow

1. **Database**: Postgres stores documents and their revisions.
2. **Scripts**: 
   - `enhanced-blog-generator.mjs` renders individual HTML pages for each post and creates the index page
   - `improved-lexical-renderer.mjs` converts Lexical JSON to HTML with support for custom nodes
   - `generate-rss.mjs` creates an RSS feed of all public documents
3. **Export Process**: Scripts generate a complete static blog with index and post pages.
4. **Deployment**: The generated files in the `blog-static-export` directory can be deployed to any static hosting.

### Key Components

- **`/scripts/export-blog.sh`**: Main script to export the entire blog.
- **`/scripts/enhanced-blog-generator.mjs`**: Creates individual HTML files for each blog post and the index page.
- **`/scripts/improved-lexical-renderer.mjs`**: Converts Lexical JSON to HTML with proper node handling.
- **`/scripts/generate-rss.mjs`**: Generates the RSS feed from public documents.
- **`/scripts/serve-blog.sh`**: Local development server to test the static blog.

## Features

- **Static HTML Generation**: All blog pages are pre-rendered as static HTML.
- **Lexical Content Rendering**: Proper conversion of Lexical editor content to HTML with support for:
  - Headings, paragraphs, and formatted text
  - Math expressions (rendered via MathJax)
  - Code blocks (with syntax highlighting)
  - Images and other media
  - Lists and tables
- **RSS Feed**: An RSS feed is generated for blog subscribers.
- **SEO Optimization**: Each blog post includes proper metadata for search engines.
- **Responsive Design**: The blog is fully responsive and works on all device sizes.
- **URL Structure**: Clean URL structure with `/blog/[handle]/` format.

## Publishing Workflow

1. Create and edit documents in the Math Editor application.
2. Mark documents as `published: true` and `private: false` to make them eligible for the blog.
3. Set a `handle` (slug) for each document to define its URL.
4. Run `npm run export-blog` to generate the static blog.
5. Deploy the contents of the `blog-static-export` directory to your hosting service.

## Technical Details

### Static Generation

The blog uses direct HTML generation from the database:

```javascript
// Generate individual HTML files for each post
async function generateBlogPosts() {
  const posts = await prisma.document.findMany({
    where: { published: true, private: false, type: 'DOCUMENT' },
    // ...
  });
  
  for (const post of posts) {
    // Get the revision content
    const revision = await prisma.revision.findUnique({
      where: { id: post.head },
      select: { html: true }
    });
    
    // Generate HTML file for each post
    // ...
  }
}
```

### Serving the Static Blog

You can test the static blog locally using:

```bash
npm run serve-blog
```

This will start a simple HTTP server to serve your blog files.

## Deployment Options

The static blog can be deployed to any static hosting service:

1. **GitHub Pages**: Free hosting for personal and project websites.
2. **Netlify**: Simple deployment with continuous integration.
3. **Vercel**: Seamless deployment with preview environments.
4. **AWS S3 + CloudFront**: Scalable and cost-effective for high-traffic blogs.
5. **Firebase Hosting**: Fast and secure hosting with a global CDN.

## Customization

To customize the blog appearance:

1. Modify the blog page components in `/src/app/blog/`.
2. Adjust the Tailwind CSS classes to match your design preferences.
3. Add custom CSS in `/src/app/globals.css` if needed.

## Future Enhancements

Potential future improvements to the static blog feature:

1. **Table of Contents**: Automatically generate a table of contents for each post.
2. **Related Posts**: Show related posts at the end of each blog post.
3. **Search Functionality**: Add client-side search to the blog.
4. **Categories & Tags**: Support categorizing and tagging blog posts.
5. **Social Sharing**: Add social media sharing buttons to blog posts.
