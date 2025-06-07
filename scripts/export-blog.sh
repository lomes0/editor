#!/bin/bash
# Script to export static blog pages

# Set environment variables for blog export
export NODE_ENV=production
export BLOG_EXPORT=true
export NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL:-"https://example.com"}

# Clean previous export
echo "Cleaning previous blog export..."
rm -rf blog-static-export/*

# Create blog directory structure
echo "Creating blog directory structure..."
mkdir -p blog-static-export/blog

# Install required dependencies if they don't exist
echo "Checking for required dependencies..."
if ! npm list jsdom | grep -q jsdom; then
  echo "Installing jsdom for headless browser rendering..."
  npm install --save-dev jsdom
  # Force the Node module cache to be refreshed
  rm -rf node_modules/.cache
fi

# Also ensure we have @lexical/html for rendering
if ! npm list @lexical/html | grep -q @lexical/html; then
  echo "Installing @lexical/html for HTML rendering..."
  npm install --save @lexical/html
fi

# Make sure we have the right version of lexical components
if ! npm list lexical | grep -q lexical; then
  echo "Installing lexical for HTML rendering..."
  npm install --save lexical @lexical/headless
fi

# Clear module cache to prevent caching issues
NODE_OPTIONS="--no-cache"

# Copy index.html template to export directory
echo "Copying main index.html template..."
cp scripts/templates/index.html blog-static-export/index.html

# Generate blog posts using the enhanced renderer
echo "Generating blog posts with enhanced Lexical rendering..."
# Use Node with experimental modules without clearing cache
NODE_OPTIONS="--experimental-vm-modules" node scripts/enhanced-blog-generator.mjs

# Generate RSS feed
echo "Generating RSS feed..."
node scripts/generate-rss.mjs

# Add .htaccess file if it doesn't exist
if [ ! -f blog-static-export/blog/.htaccess ]; then
  echo "Adding .htaccess file for proper URL routing..."
  cp scripts/templates/htaccess.txt blog-static-export/blog/.htaccess 2>/dev/null || :
fi

# Generate individual blog posts with Lexical rendering
echo "Generating individual blog posts..."
node scripts/blog-html-generator.mjs

echo "Blog export completed successfully!"
echo "Static files are available in the blog-static-export directory"
echo ""
echo "To serve the blog locally, run: npm run serve-blog"
