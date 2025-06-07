// Helper function to extract a preview from Lexical data
function getPreviewFromLexicalData(data) {
  try {
    // This is a simple implementation for now
    // In a real implementation, you'd want to properly traverse the Lexical tree
    if (!data || !data.root || !data.root.children) {
      return '<p>No content available</p>';
    }

    let html = '';
    
    // Process each node in the Lexical structure
    for (const node of data.root.children) {
      if (node.type === 'paragraph') {
        html += processLexicalParagraph(node);
      } else if (node.type === 'heading') {
        html += processLexicalHeading(node);
      } else if (node.type === 'list') {
        html += processLexicalList(node);
      } else if (node.type === 'image') {
        html += processLexicalImage(node);
      } else if (node.type === 'code') {
        html += processLexicalCode(node);
      } else {
        // For unsupported node types, add a placeholder
        html += `<div class="unsupported-node">(Unsupported content type: ${node.type})</div>`;
      }
    }
    
    return html;
  } catch (error) {
    console.error('Error processing Lexical data:', error);
    return `<p>Error rendering content: ${error.message}</p>`;
  }
}

// Process paragraph nodes
function processLexicalParagraph(node) {
  if (!node.children || node.children.length === 0) {
    return '<p></p>';
  }
  
  const content = node.children.map(child => processLexicalTextNode(child)).join('');
  return `<p>${content}</p>`;
}

// Process heading nodes
function processLexicalHeading(node) {
  if (!node.children || node.children.length === 0) {
    return `<h${node.tag}></h${node.tag}>`;
  }
  
  const content = node.children.map(child => processLexicalTextNode(child)).join('');
  return `<h${node.tag}>${content}</h${node.tag}>`;
}

// Process list nodes
function processLexicalList(node) {
  if (!node.children || node.children.length === 0) {
    return node.listType === 'bullet' ? '<ul></ul>' : '<ol></ol>';
  }
  
  const listItems = node.children.map(item => {
    if (item.type !== 'listitem') return '';
    
    const content = item.children
      ? item.children.map(child => {
          if (child.type === 'paragraph') return processLexicalParagraph(child);
          return processLexicalTextNode(child);
        }).join('')
      : '';
      
    return `<li>${content}</li>`;
  }).join('');
  
  return node.listType === 'bullet' 
    ? `<ul>${listItems}</ul>` 
    : `<ol>${listItems}</ol>`;
}

// Process image nodes
function processLexicalImage(node) {
  const alt = escapeHtml(node.altText || '');
  return `<img src="${escapeHtml(node.src)}" alt="${alt}" class="img-fluid" />`;
}

// Process code nodes
function processLexicalCode(node) {
  const language = node.language || '';
  const code = escapeHtml(node.code || '');
  
  return `<pre class="language-${language}"><code>${code}</code></pre>`;
}

// Process text nodes and inline formatting
function processLexicalTextNode(node) {
  if (typeof node === 'string') return escapeHtml(node);
  if (!node) return '';
  
  let text = node.text || '';
  text = escapeHtml(text);
  
  // Apply formatting if present
  if (node.format) {
    if (node.format & 1) text = `<b>${text}</b>`; // Bold
    if (node.format & 2) text = `<i>${text}</i>`; // Italic
    if (node.format & 4) text = `<u>${text}</u>`; // Underline
    if (node.format & 8) text = `<del>${text}</del>`; // Strikethrough
    if (node.format & 16) text = `<code>${text}</code>`; // Code
    if (node.format & 32) text = `<sub>${text}</sub>`; // Subscript
    if (node.format & 64) text = `<sup>${text}</sup>`; // Superscript
  }
  
  return text;
}

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

export { getPreviewFromLexicalData, escapeHtml };
