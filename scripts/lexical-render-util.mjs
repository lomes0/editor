// Utility script to render Lexical JSON to HTML using the headless editor
// We're dynamically importing dependencies to avoid duplicate import issues
import path from 'path';
import fs from 'fs';

// Basic editor config for blog rendering
const editorConfig = {
  namespace: 'BlogPost',
  nodes: [], // We'll keep this empty as nodes are registered dynamically
  theme: {
    // Basic theme for rendering elements
    text: {
      bold: 'blog-text-bold',
      italic: 'blog-text-italic',
      underline: 'blog-text-underline',
    },
    heading: {
      h1: 'blog-heading-h1',
      h2: 'blog-heading-h2',
      h3: 'blog-heading-h3',
    },
  },
  onError: (error) => {
    console.error('Lexical Editor Error:', error);
  },
};

// Render Lexical JSON to HTML
export const renderLexicalToHtml = async function(lexicalJson) {
  try {
    // Try to use the improved renderer first
    try {
      // Use dynamic import for improved renderer
      const { renderLexicalContent } = await import('./improved-lexical-renderer.mjs');
      return await renderLexicalContent(lexicalJson);
    } catch (improvedError) {
      console.warn('Could not use improved renderer, falling back to basic rendering:', improvedError.message);
      
      // Fall back to basic rendering with dynamic imports
      const { createHeadlessEditor } = await import('@lexical/headless');
      const { $generateHtmlFromNodes } = await import('@lexical/html');
      
      const editor = createHeadlessEditor(editorConfig);
      const editorState = editor.parseEditorState(lexicalJson);
      editor.setEditorState(editorState);
      
      return editor.getEditorState().read(() => {
        try {
          return $generateHtmlFromNodes(editor);
        } catch (htmlError) {
          console.error('Error generating HTML from nodes:', htmlError);
          return `<p>Error rendering content: ${htmlError.message}</p>
                  <p>Try installing JSDOM with: npm install --save-dev jsdom</p>`;
        }
      });
    }
  } catch (error) {
    console.error('Error rendering Lexical to HTML:', error);
    return `<p>Error rendering content: ${error.message}</p>`;
  }
};
