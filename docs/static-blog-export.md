# Static Blog Export Feature

This feature allows exporting blog posts from the Math Editor as static HTML files, enabling them to be hosted on any web server without requiring the full Math Editor application.

## How It Works

The static blog export process:

1. Fetches all published, non-private blog posts from the database
2. Converts the Lexical JSON content to HTML using our custom renderer
3. Creates appropriate directory structures for each blog post
4. Generates an index page and RSS feed
5. Adds necessary CSS styles and JavaScript for complex content like math formulas and code blocks

## Key Components

### 1. `export-blog.sh`

The main script that orchestrates the export process:
- Sets up environment variables
- Cleans previous exports
- Creates the necessary directory structure
- Installs required dependencies (like JSDom if needed)
- Runs the blog generator scripts
- Adds .htaccess files for proper URL routing

### 2. `improved-lexical-renderer.mjs`

A robust Lexical JSON to HTML converter that:
- Uses JSDom for headless rendering when available
- Falls back to a basic HTML generation approach when JSDom isn't available
- Handles specialized nodes like Math, Tables, Images, etc.
- Post-processes HTML to enhance display with proper styling and scripts

### 3. `enhanced-blog-generator.mjs`

Manages the overall blog post generation:
- Fetches posts from the database
- Uses the Lexical renderer to convert content to HTML
- Creates the proper directory structure
- Generates the index page and individual post pages
- Adds appropriate styling and responsive design

## Fallback Rendering

A key feature of our solution is the fallback rendering capability when JSDom is not available. This ensures that blogs can be generated in various environments, even when dependencies are missing.

The fallback renderer:
- Parses the Lexical JSON structure directly
- Creates appropriate HTML elements for each node type
- Handles complex structures like tables, lists, and math formulas
- Ensures proper styling and layout of the content

## Supported Node Types

The renderer supports a wide range of Lexical node types:

- **Basic Nodes**: Paragraphs, headings, text formatting
- **Math Nodes**: Both inline and display math formulas with MathJax support
- **Media Nodes**: Images, sketches, graphs, and iframes
- **Tables**: Full table structure including header cells, rowspan, and colspan
- **Code Blocks**: With syntax highlighting via Prism.js
- **Lists**: Ordered and unordered lists with proper nesting
- **Layout**: Layout containers and items for more complex designs
- **Other Elements**: Horizontal rules, quotes, details/summary, etc.

## Styling and Scripts

The export process automatically includes:
- MathJax for rendering math formulas
- Prism.js for code syntax highlighting
- Responsive CSS for mobile-friendly display
- Tailwind CSS for basic styling

## URL Structure

The exported blog uses a clean URL structure:
- Main index: `/index.html`
- Blog index: `/blog/index.html`
- Individual posts: `/blog/[post-handle]/index.html`
- RSS feed: `/blog/rss.xml`

## Apache Configuration

A `.htaccess` file is included to enable clean URLs (removing the need for `index.html` in URLs) and set appropriate caching and MIME types.

## Usage

To export the blog:

```bash
npm run export-blog
```

To serve the exported blog locally for testing:

```bash
npm run serve-blog            # Uses default port (tries 3333, then next available)
npm run serve-blog -- 8080    # Specifies custom port 8080
```

## Customization

The blog appearance can be customized by modifying:
- CSS styles in `enhanced-blog-generator.mjs`
- HTML templates in the same file
- Post-processing functions in `improved-lexical-renderer.mjs`
