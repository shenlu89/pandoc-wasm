# pandoc-wasm

[![npm version](https://badge.fury.io/js/pandoc-wasm.svg)](https://badge.fury.io/js/pandoc-wasm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A complete npm package that brings the power of [Pandoc](https://pandoc.org/) to JavaScript environments through WebAssembly. Convert documents between multiple formats with zero dependencies on system binaries.

## ✨ Features

- 🚀 **Universal**: Works in Node.js, Deno, Bun, and browsers
- 🛠️ **CLI Tool**: Drop-in replacement for native pandoc
- 📦 **Zero Dependencies**: No system installation required
- 🎯 **Type Safe**: Full TypeScript support with comprehensive types
- 🌐 **Cross Platform**: Runs anywhere JavaScript runs
- ⚡ **Fast**: WebAssembly performance with JavaScript convenience

## 🚀 Quick Start

### CLI Installation

```bash
# Install globally
npm install -g pandoc-wasm

# Use immediately
pandoc-wasm -f markdown -t html README.md output.html
```

### API Usage

```javascript
import pandoc from 'pandoc-wasm';

// Simple conversion
const result = await pandoc.convert('# Hello World', {
  from: 'markdown',
  to: 'html',
  standalone: true
});

console.log(result.output);
// Output: <!DOCTYPE html><html>...
```

## 📖 API Reference

### Core API

#### `convert(input, options)`

Convert text between formats.

```typescript
import { convert } from 'pandoc-wasm';

const result = await convert(inputText, {
  from: 'markdown',
  to: 'html',
  standalone: true,
  toc: true,
  metadata: {
    title: 'My Document',
    author: 'John Doe'
  }
});
```

#### `convertFile(inputPath, outputPath, options)`

Convert files (Node.js only).

```typescript
import { convertFile } from 'pandoc-wasm';

await convertFile('input.md', 'output.html', {
  from: 'markdown',
  to: 'html',
  standalone: true,
  createDir: true  // Create output directory if needed
});
```

### Browser Usage

```javascript
import { convertInBrowser } from 'pandoc-wasm/browser';

const result = await convertInBrowser(inputText, {
  from: 'markdown',
  to: 'html'
}, '/path/to/pandoc.wasm');
```

### CLI Usage

The CLI tool supports all standard Pandoc options:

```bash
# Basic conversion
pandoc-wasm -f markdown -t html input.md

# With options
pandoc-wasm -f markdown -t html --standalone --toc input.md output.html

# Using pipes
echo "# Hello" | pandoc-wasm -f markdown -t html

# Multiple CSS files
pandoc-wasm -f markdown -t html --css style1.css --css style2.css input.md

# With metadata
pandoc-wasm -f markdown -t html -M title:"My Doc" -M author:"John" input.md
```

## 🎯 Supported Formats

### Input Formats
- **Markdown**: `markdown`, `gfm`, `commonmark`
- **Markup**: `html`, `latex`, `rst`, `org`, `textile`
- **Documents**: `docx`, `odt`, `epub`
- **Data**: `json`, `csv`
- **Wiki**: `mediawiki`, `dokuwiki`, `twiki`

### Output Formats
- **Web**: `html`, `html5`, `epub`
- **Documents**: `pdf`, `docx`, `odt`, `rtf`
- **Markup**: `latex`, `markdown`, `rst`, `org`
- **Presentation**: `beamer`, `revealjs`, `slidy`
- **Data**: `json`, `plain`

## 🔧 Configuration Options

```typescript
interface PandocOptions {
  from?: string;           // Input format
  to?: string;             // Output format
  standalone?: boolean;    // Produce standalone document
  toc?: boolean;          // Include table of contents
  tocDepth?: number;      // TOC depth (1-6)
  template?: string;      // Custom template file
  css?: string[];         // CSS files to include
  metadata?: Record<string, any>;  // Document metadata
  variables?: Record<string, string>; // Template variables
  filters?: string[];     // Pandoc filters
  luaFilters?: string[]; // Lua filters
}
```

## 🌍 Runtime Support

### Node.js

```javascript
// CommonJS
const pandoc = require('pandoc-wasm-cli');

// ES Modules
import pandoc from 'pandoc-wasm-cli';
```

### Deno

```typescript
import pandoc from 'https://deno.land/x/pandoc_wasm/mod.ts';
```

### Bun

```javascript
import pandoc from 'pandoc-wasm';
// Optimized for Bun's fast startup
```

### Browser

```html
<script type="module">
  import { convertInBrowser } from 'https://unpkg.com/pandoc-wasm/dist/browser.mjs';
  
  const result = await convertInBrowser(markdown, {
    from: 'markdown',
    to: 'html'
  });
</script>
```

## 🎮 Demo Application

Check out the interactive demo at [demo URL] or run it locally:

```bash
git clone https://github.com/your-username/pandoc-wasm
cd pandoc-wasm/demo
npm install
npm run dev
```

The demo includes:
- 📁 Drag & drop file upload
- 🔄 Real-time conversion preview
- 📚 Format selection with 20+ options
- 📋 Conversion history
- 💾 Download converted files
- 📱 Responsive design

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Pandoc](https://pandoc.org/) - The universal document converter
- [ghc-wasm](https://gitlab.haskell.org/haskell-wasm/ghc-wasm-meta) - GHC WebAssembly backend
- [browser_wasi_shim](https://github.com/bjorn3/browser_wasi_shim) - WASI implementation for browsers

## 🔗 Links

- [Pandoc Manual](https://pandoc.org/MANUAL.html)
- [WebAssembly](https://webassembly.org/)
- [Live Demo](https://your-demo-url.com)

---

Made with ❤️ by the community