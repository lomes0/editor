# Math Editor

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/IBastawisi/math-editor/blob/master/LICENSE)
[![demo](https://img.shields.io/badge/live-demo-blue)](https://matheditor.ml/playground)

A rich text editor for scientific content, with Markdown helpers, Mathlive, Geogebra and Excalidraw Extensions.
The project aims to make writing publication-quality documents easy and accessible.

## Features

- Rich Text: Text formatting, Copy + Paste Preformatted text, Code syntax highlighting, Insert Images, Tables and Sticky notes.
- Math: Integrates with [Mathlive](https://cortexjs.io/mathlive) for writing LaTeX with a Virtual Keyboard.
- Graph: Integrates with [Geogebra](https://www.geogebra.org) for graphing functions and shapes.
- Sketch: Integrates with [Excalidraw](https://excalidraw.com/) for hand-drawn like sketches.
- Static Blog Export: Generate static HTML files for your blog posts that can be hosted anywhere.

## Getting Started

```
git clone https://github.com/IBastawisi/matheditor.git
cd matheditor
npm install
npm run dev
```

## Static Blog Export

Export your blog posts as static HTML files that can be hosted on any web server without requiring the full application:

```
npm run export-blog            # Export blog to static HTML
npm run serve-blog             # Test the exported blog locally (auto-selects port)
npm run serve-blog -- 8080     # Test with a specific port
```

This feature:
- Converts Lexical editor content to clean HTML
- Properly renders math formulas using MathJax
- Handles complex structures like tables and code blocks
- Creates a responsive, mobile-friendly blog

See [static-blog-export.md](docs/static-blog-export.md) for more details.