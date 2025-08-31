import { describe, it, expect, beforeAll } from 'vitest';
import { PandocWasm } from '../core/pandoc-wasm';
import { convert } from '../api/convert';

describe('PandocWasm', () => {
  let pandoc: PandocWasm;

  beforeAll(async () => {
    pandoc = new PandocWasm();
    // Note: In real tests, you'd need the actual WASM file
    // For now, we'll test the API structure
  });

  it('should create instance', () => {
    expect(pandoc).toBeInstanceOf(PandocWasm);
  });

  it('should build args correctly', () => {
    const args = pandoc.buildArgs({
      from: 'markdown',
      to: 'html',
      standalone: true,
      toc: true
    });
    
    expect(args).toContain('-f markdown');
    expect(args).toContain('-t html');
    expect(args).toContain('--standalone');
    expect(args).toContain('--toc');
  });

  it('should handle metadata options', () => {
    const args = pandoc.buildArgs({
      metadata: {
        title: 'Test Document',
        author: 'Test Author'
      }
    });
    
    expect(args).toContain('--metadata=title:Test Document');
    expect(args).toContain('--metadata=author:Test Author');
  });

  it('should handle CSS options', () => {
    const args = pandoc.buildArgs({
      css: ['style1.css', 'style2.css']
    });
    
    expect(args).toContain('--css=style1.css');
    expect(args).toContain('--css=style2.css');
  });
});

describe('convert API', () => {
  it('should export convert function', () => {
    expect(typeof convert).toBe('function');
  });
});