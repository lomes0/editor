// Enhanced Lexical JSON to HTML renderer for headless rendering
import fs from 'fs';
import path from 'path';

// We'll handle JSDom conditionally - it might not be available in all environments
let JSDOM;
let jsdomInitialized = false;

// Initialize JSDOM in a function that can be called on demand
async function initJSDOM() {
  if (jsdomInitialized) return true;
  
  try {
    // Check if jsdom is installed
    const jsdomModule = await import('jsdom');
    JSDOM = jsdomModule.JSDOM;
    
    // Initialize JSDom to provide a browser-like environment for Lexical
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
      runScripts: 'outside-only'
    });
    
    // Set up the global objects needed for headless rendering
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    global.Element = dom.window.Element;
    global.HTMLElement = dom.window.HTMLElement;
    global.HTMLDivElement = dom.window.HTMLDivElement;
    global.DOMParser = dom.window.DOMParser;
    global.Node = dom.window.Node;
    global.getComputedStyle = dom.window.getComputedStyle;
    global.customElements = dom.window.customElements;
    global.HTMLSpanElement = dom.window.HTMLSpanElement;
    global.HTMLParagraphElement = dom.window.HTMLParagraphElement;
    global.HTMLHeadingElement = dom.window.HTMLHeadingElement;
    
    // Add other browser-specific globals that might be used by Lexical
    global.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 0);
    };
    global.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
    
    jsdomInitialized = true;
    console.log('JSDom initialized successfully for headless rendering');
    return true;
  } catch (error) {
    console.warn('JSDom not available or failed to initialize:', error.message);
    return false;
  }
}

// Basic node configurations for various Lexical nodes
const nodeTransformers = {
  // Headings get appropriate HTML elements with classes
  heading: (element, node) => {
    const level = node.tag || '1';
    element.classList.add(`heading-${level}`);
    // For headings, we need to create the right element type
    const headingElement = document.createElement(`h${level}`);
    // Copy attributes and content
    Array.from(element.attributes).forEach(attr => {
      headingElement.setAttribute(attr.name, attr.value);
    });
    headingElement.innerHTML = element.innerHTML;
    return headingElement;
  },
  // Handle layout-container nodes
  'layout-container': (element, node) => {
    element.classList.add('layout-container');
    if (node.format) {
      element.classList.add(`layout-container-${node.format}`);
    }
    // Set display style for flex layout
    element.style.display = 'flex';
    element.style.flexWrap = 'wrap';
    return element;
  },
  // Handle math nodes
  math: (element, node) => {
    if (node.inline) {
      element.classList.add('math-inline');
      element.setAttribute('data-mode', 'inline');
    } else {
      element.classList.add('math-display');
      element.setAttribute('data-mode', 'display');
    }
    element.innerHTML = node.value || '';
    return element;
  },
  // Handle image nodes
  image: (element, node) => {
    if (node.src) element.setAttribute('src', node.src);
    if (node.altText) element.setAttribute('alt', node.altText);
    if (node.width) element.style.width = `${node.width}px`;
    if (node.height) element.style.height = `${node.height}px`;
    element.classList.add('blog-image');
    return element;
  },
  // Handle sketch nodes (based on Excalidraw)
  sketch: (element, node) => {
    if (node.src) element.setAttribute('src', node.src);
    if (node.altText) element.setAttribute('alt', node.altText || 'Sketch drawing');
    if (node.width) element.style.width = `${node.width}px`;
    if (node.height) element.style.height = `${node.height}px`;
    element.classList.add('blog-sketch');
    return element;
  },
  // Handle graph nodes
  graph: (element, node) => {
    if (node.src) element.setAttribute('src', node.src);
    if (node.altText) element.setAttribute('alt', node.altText || 'Graph');
    if (node.width) element.style.width = `${node.width}px`;
    if (node.height) element.style.height = `${node.height}px`;
    element.classList.add('blog-graph');
    return element;
  },
  // Handle code blocks
  code: (element, node) => {
    element.classList.add('code-block');
    if (node.language) {
      element.classList.add(`language-${node.language}`);
    }
    return element;
  },
  // Handle table nodes
  table: (element, node) => {
    element.classList.add('blog-table');
    // Apply any additional styles
    if (node.style) {
      element.setAttribute('style', node.style);
    }
    return element;
  },
  // Handle table cell nodes
  tableCell: (element, node) => {
    // Apply header state if applicable
    if (node.headerState) {
      element.setAttribute('data-header-state', node.headerState);
    }
    // Apply colspan if applicable
    if (node.colSpan && node.colSpan > 1) {
      element.setAttribute('colspan', node.colSpan);
    }
    // Apply rowspan if applicable
    if (node.rowSpan && node.rowSpan > 1) {
      element.setAttribute('rowspan', node.rowSpan);
    }
    // Apply width if applicable
    if (node.width) {
      element.style.width = node.width;
    }
    // Apply background color if applicable
    if (node.backgroundColor) {
      element.style.backgroundColor = node.backgroundColor;
    }
    // Apply any additional styles
    if (node.style) {
      element.setAttribute('style', node.style);
    }
    return element;
  },
  // Handle iframe nodes
  iframe: (element, node) => {
    if (node.src) element.setAttribute('src', node.src);
    if (node.width) element.style.width = `${node.width}px`;
    if (node.height) element.style.height = `${node.height}px`;
    element.classList.add('blog-iframe');
    // Add sandbox and other security attributes
    element.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    element.setAttribute('loading', 'lazy');
    return element;
  },
  // Handle details node
  details: (element, node) => {
    element.classList.add('blog-details');
    return element;
  }
};

// Configuration for the Lexical editor
const editorConfig = {
  namespace: 'BlogRenderer',
  theme: {
    // Basic theme settings for common elements
    paragraph: 'blog-paragraph',
    text: {
      bold: 'blog-text-bold',
      italic: 'blog-text-italic',
      underline: 'blog-text-underline',
      code: 'blog-text-code',
    },
    heading: {
      h1: 'blog-h1',
      h2: 'blog-h2',
      h3: 'blog-h3',
      h4: 'blog-h4',
      h5: 'blog-h5',
    },
    list: {
      ul: 'blog-ul',
      ol: 'blog-ol',
      listitem: 'blog-listitem',
    },
    link: 'blog-link',
    image: 'blog-image',
    math: 'blog-math',
  },
  onError: (error) => {
    console.error('Lexical editor error:', error);
  },
};

// Post-process HTML to handle custom elements and styling
function postProcessHtml(html) {
  if (!html) return html;
  
  // Handle math elements
  if (html.includes('class="math-')) {
    // Add MathJax support
    html = `
<!DOCTYPE html>
<html>
<head>
  <script>
  MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
      displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
      processEscapes: true
    },
    svg: {
      fontCache: 'global'
    }
  };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
  ${html}
</body>
</html>`;
  }

  // Handle code syntax highlighting
  if (html.includes('class="code-block') || html.includes('class="language-')) {
    // Replace basic code block format with proper Prism.js compatible format
    html = html.replace(/<pre><code class="code-block(.*?)">([\s\S]*?)<\/code><\/pre>/g, (match, languageClass, code) => {
      const language = languageClass.trim() || 'text';
      // Escape HTML entities in the code
      const escapedCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&');
      return `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
    });
    
    // Add Prism.js for syntax highlighting
    if (!html.includes('</head>')) {
      html = `
<!DOCTYPE html>
<html>
<head>
  <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-typescript.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-jsx.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-tsx.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-python.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-java.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-c.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-cpp.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-csharp.min.js"></script>
</head>
<body>
  ${html}
  <script>Prism.highlightAll();</script>
</body>
</html>`;
    } else {
      // Add Prism CSS and JS to existing head
      html = html.replace('</head>', `
  <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-typescript.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-jsx.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-tsx.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-python.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-java.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-c.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-cpp.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-csharp.min.js"></script>
</head>`);
      
      // Add Prism initialization script
      html = html.replace('</body>', '<script>Prism.highlightAll();</script></body>');
    }
  }

  // Handle responsive tables
  if (html.includes('<table')) {
    // Add CSS for responsive tables
    const tableStyles = `
<style>
  .blog-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    overflow-x: auto;
    display: block;
  }
  @media (min-width: 768px) {
    .blog-table {
      display: table;
    }
  }
  .blog-table th, .blog-table td {
    border: 1px solid #e2e8f0;
    padding: 0.5rem;
    text-align: left;
  }
  .blog-table th {
    background-color: #f8fafc;
    font-weight: bold;
  }
  .blog-table tr:nth-child(even) {
    background-color: #f9fafb;
  }
</style>`;
    
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${tableStyles}</head>`);
    } else {
      html = `<html><head>${tableStyles}</head><body>${html}</body></html>`;
    }
  }

  return html;
}

// Main function to convert Lexical JSON to HTML
async function renderLexicalToHtml(lexicalJson) {
  try {
    // Basic fallback rendering for when JSDom is not available
      if (!global.document) {
        // Create a simple HTML representation based on the structure
        try {
          const jsonData = typeof lexicalJson === 'string' ? JSON.parse(lexicalJson) : lexicalJson;
          let html = '<div class="lexical-content">';
          
          if (jsonData && jsonData.root && jsonData.root.children) {
            for (const node of jsonData.root.children) {
              switch (node.type) {
                case 'paragraph':
                  html += `<p>${formatNodeContent(node)}</p>`;
                  break;
                case 'heading':
                  const hLevel = node.tag || '1';
                  html += `<h${hLevel}>${formatNodeContent(node)}</h${hLevel}>`;
                  break;
                case 'list':
                  const listType = node.listType === 'number' ? 'ol' : 'ul';
                  html += `<${listType}>${renderListItems(node.children)}</${listType}>`;
                  break;
                case 'code':
                  html += `<pre><code class="language-${node.language || 'text'}">${node.children?.[0]?.text || ''}</code></pre>`;
                  break;
                case 'table':
                  html += renderTable(node);
                  break;
                case 'math':
                  const mathMode = node.inline ? 'inline' : 'display';
                  html += `<div class="math-${mathMode}" data-mode="${mathMode}">${escapeHtml(node.value || '')}</div>`;
                  break;
                case 'image':
                case 'sketch':
                case 'graph':
                  let imgHtml = '<figure>';
                  imgHtml += `<img src="${node.src}" alt="${node.altText || ''}" `;
                  if (node.width) imgHtml += `width="${node.width}" `;
                  if (node.height) imgHtml += `height="${node.height}" `;
                  imgHtml += '/>';
                  // Add caption if available
                  if (node.caption) {
                    imgHtml += `<figcaption>${formatNodeContent(node.caption)}</figcaption>`;
                  }
                  imgHtml += '</figure>';
                  html += imgHtml;
                  break;
                case 'iframe':
                  html += `<iframe src="${node.src}" sandbox="allow-scripts allow-same-origin" loading="lazy" `;
                  if (node.width) html += `width="${node.width}" `;
                  if (node.height) html += `height="${node.height}" `;
                  html += '></iframe>';
                  break;
                case 'details':
                  let summary = 'Details';
                  if (node.children && node.children.length > 0) {
                    // Try to find the summary node
                    for (const child of node.children) {
                      if (child.type === 'detailsSummary') {
                        summary = formatNodeContent(child);
                        break;
                      }
                    }
                  }
                  html += `<details><summary>${summary}</summary>`;
                  if (node.children && node.children.length > 0) {
                    // Add content excluding the summary
                    for (const child of node.children) {
                      if (child.type !== 'detailsSummary') {
                        html += `<div>${formatNodeContent(child)}</div>`;
                      }
                    }
                  }
                  html += '</details>';
                  break;
                case 'horizontalRule':
                  html += '<hr/>';
                  break;
                case 'quote':
                  html += `<blockquote>${formatNodeContent(node)}</blockquote>`;
                  break;
                case 'layoutContainer':
                  html += '<div class="layout-container" style="display: flex; flex-wrap: wrap;">';
                  if (node.children && node.children.length > 0) {
                    for (const layoutItem of node.children) {
                      if (layoutItem.type === 'layoutItem') {
                        html += `<div class="layout-item" style="flex-basis: ${100 / (node.children.length || 1)}%">`;
                        if (layoutItem.children && layoutItem.children.length > 0) {
                          for (const itemChild of layoutItem.children) {
                            html += `<div>${formatNodeContent(itemChild)}</div>`;
                          }
                        }
                        html += '</div>';
                      }
                    }
                  }
                  html += '</div>';
                  break;
                default:
                  // For other node types, try to extract text
                  html += `<div>${formatNodeContent(node)}</div>`;
              }
            }
          }
          
          html += '</div>';
          return html;
        } catch (e) {
          console.error('Error in fallback rendering:', e);
          return `<p>Error rendering content without JSDom: ${e.message}</p>`;
        }
      }
    
    // If JSDom is available, use the proper Lexical rendering
    // Create a headless editor with the config
    const editor = createHeadlessEditor(editorConfig);
    
    // Parse and set the editor state
    const editorState = editor.parseEditorState(lexicalJson);
    editor.setEditorState(editorState);
    
    // Generate HTML from the editor state
    let html = await editorState.read(() => $generateHtmlFromNodes(editor));
    
    // Post-process the HTML for enhanced display
    return postProcessHtml(html);
  } catch (error) {
    console.error('Error rendering Lexical to HTML:', error);
    return `<p>Error rendering content: ${error.message}</p>`;
  }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper function to extract text from nodes (for the fallback renderer)
function extractSimpleText(node) {
  if (!node) return '';
  
  if (typeof node.text === 'string') {
    return escapeHtml(node.text);
  }
  
  if (Array.isArray(node.children)) {
    return node.children.map(extractSimpleText).join('');
  }
  
  return '';
}

// Helper function to render list items (for the fallback renderer)
function renderListItems(items) {
  if (!Array.isArray(items)) return '';
  
  return items.map(item => {
    if (item.type === 'listitem') {
      let content = formatNodeContent(item);
      
      // Check if this list item has nested lists
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          if (child.type === 'list') {
            const nestedListType = child.listType === 'number' ? 'ol' : 'ul';
            content += `<${nestedListType}>${renderListItems(child.children)}</${nestedListType}>`;
          }
        }
      }
      
      return `<li>${content}</li>`;
    }
    return '';
  }).join('');
}

// Helper function to render tables (for the fallback renderer)
function renderTable(tableNode) {
  if (!tableNode.children || !Array.isArray(tableNode.children)) {
    return '';
  }
  
  let tableHtml = '<table class="blog-table">';
  
  // Process each row
  for (const row of tableNode.children) {
    if (row.type !== 'tableRow') continue;
    
    tableHtml += '<tr>';
    
    // Process each cell in the row
    if (row.children && Array.isArray(row.children)) {
      for (const cell of row.children) {
        if (cell.type !== 'tableCell') continue;
        
        // Determine if it's a header cell
        const cellTag = cell.headerState ? 'th' : 'td';
        
        // Add colspan and rowspan attributes if applicable
        let attributes = '';
        if (cell.colSpan && cell.colSpan > 1) {
          attributes += ` colspan="${cell.colSpan}"`;
        }
        if (cell.rowSpan && cell.rowSpan > 1) {
          attributes += ` rowspan="${cell.rowSpan}"`;
        }
        
        // Add style attributes if applicable
        let styles = '';
        if (cell.width) {
          styles += `width:${cell.width};`;
        }
        if (cell.backgroundColor) {
          styles += `background-color:${cell.backgroundColor};`;
        }
        if (styles) {
          attributes += ` style="${styles}"`;
        }
        
        tableHtml += `<${cellTag}${attributes}>`;
        
        // Add cell content
        if (cell.children && Array.isArray(cell.children)) {
          for (const content of cell.children) {
            // Handle different types of cell content
            if (content.type === 'paragraph') {
              tableHtml += `<p>${formatNodeContent(content)}</p>`;
            } else if (content.type === 'list') {
              const listType = content.listType === 'number' ? 'ol' : 'ul';
              tableHtml += `<${listType}>${renderListItems(content.children)}</${listType}>`;
            } else {
              tableHtml += formatNodeContent(content);
            }
          }
        }
        
        tableHtml += `</${cellTag}>`;
      }
    }
    
    tableHtml += '</tr>';
  }
  
  tableHtml += '</table>';
  return tableHtml;
}

// Helper functions for rendering
function renderChildren(node) {
  if (!node || !node.children || !Array.isArray(node.children)) {
    return '';
  }
  
  return node.children.map(child => renderNode(child)).join('');
}

// Extract text content from a node with formatting - renamed to avoid duplicate declarations
function formatNodeContent(node) {
  if (!node) return '';
  
  if (node.type === 'text') {
    let text = node.text || '';
    
    // Apply formatting
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
  
  // Process children if not a text node
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(child => formatNodeContent(child)).join('');
  }
  
  return '';
}

// Main rendering function that decides between headless mode and fallback
export async function renderLexicalContent(lexicalJson) {
  try {
    // Try to initialize JSDOM
    const jsdomAvailable = await initJSDOM();
    
    // Try advanced rendering with JSDOM if available
    if (jsdomAvailable && (typeof window !== 'undefined' || global.document)) {
      return await renderWithHeadlessEditor(lexicalJson);
    } else {
      // Fall back to basic rendering
      console.log("Falling back to basic rendering - JSDOM environment not available");
      return renderFallback(lexicalJson);
    }
  } catch (error) {
    console.error("Error in Lexical rendering:", error);
    return `<div class="rendering-error">Error rendering content: ${error.message}</div>`;
  }
}

// For backwards compatibility - export with the original name
export { renderLexicalContent as renderLexicalToHtml };

// Advanced rendering using the headless editor (requires JSDOM)
async function renderWithHeadlessEditor(lexicalJson) {
  try {
    // Dynamically import the modules to avoid issues
    const headlessModule = await import('@lexical/headless');
    const htmlModule = await import('@lexical/html');
    
    const editor = headlessModule.createHeadlessEditor({
      namespace: 'BlogRenderer',
      onError: (error) => {
        console.error('Lexical Editor Error:', error);
      },
    });

    const editorState = editor.parseEditorState(lexicalJson);
    editor.setEditorState(editorState);
    
    return editor.getEditorState().read(() => {
      return htmlModule.$generateHtmlFromNodes(editor);
    });
  } catch (error) {
    console.error('Error in headless rendering:', error);
    return renderFallback(lexicalJson);
  }
}

// Fallback rendering for when JSDOM is not available
function renderFallback(lexicalJson) {
  try {
    // Parse the JSON if it's a string
    const editorState = typeof lexicalJson === 'string' ? JSON.parse(lexicalJson) : lexicalJson;
    
    // Start with a container div
    let html = '<div class="blog-content">';
    
    // Process the root node
    if (editorState && editorState.root && editorState.root.children) {
      for (const node of editorState.root.children) {
        html += renderNode(node);
      }
    }
    
    html += '</div>';
    return html;
  } catch (error) {
    console.error('Error in fallback renderer:', error);
    return `<div class="rendering-error">Error rendering content in fallback mode: ${error.message}</div>`;
  }
}

// Helper function to render individual nodes
function renderNode(node) {
  if (!node || !node.type) {
    return '';
  }
  
  switch (node.type) {
    case 'paragraph':
      return `<p>${renderChildren(node)}</p>`;
    case 'heading':
      const level = node.tag || '1';
      return `<h${level} class="heading-${level}">${renderChildren(node)}</h${level}>`;
    case 'layout-container':
      return `<div class="layout-container ${node.format ? 'layout-container-' + node.format : ''}">${renderChildren(node)}</div>`;
    case 'list':
      const listType = node.listType === 'number' ? 'ol' : 'ul';
      return `<${listType}>${renderListItems(node.children)}</${listType}>`;
    case 'table':
      return renderTable(node);
    case 'image':
      let imgHtml = `<img class="blog-image"`;
      if (node.src) imgHtml += ` src="${node.src}"`;
      if (node.altText) imgHtml += ` alt="${node.altText}"`;
      if (node.width) imgHtml += ` width="${node.width}"`;
      if (node.height) imgHtml += ` height="${node.height}"`;
      imgHtml += '>';
      return imgHtml;
    case 'math':
      let mathClass = node.inline ? 'math-inline' : 'math-display';
      return `<div class="${mathClass}" data-mode="${node.inline ? 'inline' : 'display'}">${node.value || ''}</div>`;
    default:
      return renderChildren(node);
  }
}
