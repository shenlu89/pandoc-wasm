#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { PandocWasm } from './core/pandoc-wasm';

const program = new Command();

program
  .name('pandoc-wasm')
  .description('Pandoc document converter compiled to WebAssembly')
  .version('1.0.0');

program
  .argument('[input]', 'Input file (default: stdin)')
  .argument('[output]', 'Output file (default: stdout)')
  .option('-f, --from <format>', 'Input format')
  .option('-t, --to <format>', 'Output format')
  .option('-s, --standalone', 'Produce standalone document')
  .option('--toc', 'Include table of contents')
  .option('--toc-depth <number>', 'Table of contents depth', '3')
  .option('--template <file>', 'Use template file')
  .option('--css <file>', 'Link to CSS file (can be used multiple times)')
  .option('-M, --metadata <key:value>', 'Set metadata (can be used multiple times)')
  .option('-V, --variable <key:value>', 'Set template variable (can be used multiple times)')
  .option('--filter <filter>', 'Use filter (can be used multiple times)')
  .option('--lua-filter <filter>', 'Use Lua filter (can be used multiple times)')
  .option('-o, --output <file>', 'Output file')
  .option('--data-dir <dir>', 'Data directory')
  .option('--verbose', 'Verbose output')
  .option('--quiet', 'Suppress warnings')
  .action(async (input, output, options) => {
    try {
      const pandoc = new PandocWasm();
      await pandoc.initialize();

      // Read input
      let inputText = '';
      if (input && existsSync(input)) {
        inputText = readFileSync(input, 'utf-8');
      } else if (!process.stdin.isTTY) {
        // Read from stdin
        inputText = await readStdin();
      } else if (input) {
        console.error(`Error: Input file '${input}' not found`);
        process.exit(1);
      }

      // Build arguments string
      const args = buildArgsFromOptions(options);
      
      // Convert
      const result = pandoc.convert(args, inputText);

      if (!result.success) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }

      // Write output
      const outputFile = options.output || output;
      if (outputFile) {
        writeFileSync(outputFile, result.output);
        if (!options.quiet) {
          console.log(`Output written to ${outputFile}`);
        }
      } else {
        process.stdout.write(result.output);
      }

    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

// Add help command
program
  .command('help')
  .description('Show detailed help information')
  .action(() => {
    console.log(`
pandoc-wasm - Pandoc document converter compiled to WebAssembly

USAGE:
  pandoc-wasm [OPTIONS] [INPUT] [OUTPUT]
  pandoc-wasm -f markdown -t html input.md output.html

COMMON OPTIONS:
  -f, --from FORMAT     Input format (markdown, html, latex, etc.)
  -t, --to FORMAT       Output format (html, pdf, docx, etc.)
  -s, --standalone      Produce standalone document
  -o, --output FILE     Output file
  --toc                 Include table of contents
  --template FILE       Use custom template
  --css FILE            Link to CSS file

EXAMPLES:
  # Convert Markdown to HTML
  pandoc-wasm -f markdown -t html README.md

  # Convert with table of contents
  pandoc-wasm -f markdown -t html --toc --standalone input.md output.html

  # Use stdin/stdout
  echo "# Hello" | pandoc-wasm -f markdown -t html

For more information, visit: https://pandoc.org/MANUAL.html
    `);
  });

function buildArgsFromOptions(options: any): string {
  const args: string[] = [];

  if (options.from) args.push(`-f ${options.from}`);
  if (options.to) args.push(`-t ${options.to}`);
  if (options.standalone) args.push('--standalone');
  if (options.toc) args.push('--toc');
  if (options.tocDepth) args.push(`--toc-depth=${options.tocDepth}`);
  if (options.template) args.push(`--template=${options.template}`);
  if (options.dataDir) args.push(`--data-dir=${options.dataDir}`);
  if (options.verbose) args.push('--verbose');
  if (options.quiet) args.push('--quiet');

  // Handle arrays
  if (options.css) {
    const cssFiles = Array.isArray(options.css) ? options.css : [options.css];
    cssFiles.forEach(css => args.push(`--css=${css}`));
  }

  if (options.metadata) {
    const metadata = Array.isArray(options.metadata) ? options.metadata : [options.metadata];
    metadata.forEach(meta => args.push(`--metadata=${meta}`));
  }

  if (options.variable) {
    const variables = Array.isArray(options.variable) ? options.variable : [options.variable];
    variables.forEach(variable => args.push(`--variable=${variable}`));
  }

  if (options.filter) {
    const filters = Array.isArray(options.filter) ? options.filter : [options.filter];
    filters.forEach(filter => args.push(`--filter=${filter}`));
  }

  if (options.luaFilter) {
    const luaFilters = Array.isArray(options.luaFilter) ? options.luaFilter : [options.luaFilter];
    luaFilters.forEach(filter => args.push(`--lua-filter=${filter}`));
  }

  return args.join(' ');
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

if (require.main === module) {
  program.parse();
}