import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig([
  // Main library builds
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: 'dist/index.mjs',
        format: 'es'
      }
    ],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      typescript({
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src'
      })
    ],
    external: ['fs', 'path', 'url', 'util']
  },
  // Browser build
  {
    input: 'src/browser.ts',
    output: {
      file: 'dist/browser.mjs',
      format: 'es'
    },
    plugins: [
      nodeResolve({ browser: true }),
      commonjs(),
      typescript({
        declaration: true,
        declarationDir: 'dist'
      })
    ]
  },
  // CLI build
  {
    input: 'src/cli.ts',
    output: {
      file: 'dist/cli.js',
      format: 'cjs',
      banner: '#!/usr/bin/env node'
    },
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      typescript()
    ],
    external: ['fs', 'path', 'url', 'util']
  }
]);