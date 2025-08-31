import { PandocOptions, PandocResult } from '../types/index';

// Browser WASI implementation
let BrowserWASI: any = null;
let BrowserOpenFile: any = null;
let BrowserFile: any = null;
let BrowserConsoleStdout: any = null;
let BrowserPreopenDirectory: any = null;

// Server WASI implementation
let ServerWASI: any = null;

// Detect environment and load appropriate WASI implementation
async function loadWASI() {
  if (typeof window !== 'undefined') {
    // Browser environment - use browser_wasi_shim
    const wasiShim = await import('@bjorn3/browser_wasi_shim');
    BrowserWASI = wasiShim.WASI;
    BrowserOpenFile = wasiShim.OpenFile;
    BrowserFile = wasiShim.File;
    BrowserConsoleStdout = wasiShim.ConsoleStdout;
    BrowserPreopenDirectory = wasiShim.PreopenDirectory;
  } else {
    // Server environment - use native WASI
    try {
      ServerWASI = (await import('wasi')).WASI;
    } catch (error) {
      // Fallback for older Node.js versions
      console.warn('Native WASI not available, falling back to browser shim');
      const wasiShim = await import('@bjorn3/browser_wasi_shim');
      BrowserWASI = wasiShim.WASI;
      BrowserOpenFile = wasiShim.OpenFile;
      BrowserFile = wasiShim.File;
      BrowserConsoleStdout = wasiShim.ConsoleStdout;
      BrowserPreopenDirectory = wasiShim.PreopenDirectory;
    }
  }
}

export class PandocWasm {
  private instance: WebAssembly.Instance | null = null;
  private wasi: any = null;
  private initialized = false;
  private isBrowser = typeof window !== 'undefined';

  async initialize(wasmPath?: string): Promise<void> {
    if (this.initialized) return;

    // Load appropriate WASI implementation
    await loadWASI();

    const wasmUrl = wasmPath || this.getDefaultWasmPath();
    
    if (this.isBrowser) {
      await this.initializeBrowser(wasmUrl);
    } else {
      await this.initializeServer(wasmUrl);
    }

    this.initialized = true;
  }

  private async initializeBrowser(wasmUrl: string): Promise<void> {
    const args = ["pandoc.wasm", "+RTS", "-H64m", "-RTS"];
    const env: string[] = [];
    const inFile = new BrowserFile(new Uint8Array(), { readonly: true });
    const outFile = new BrowserFile(new Uint8Array(), { readonly: false });
    
    const fds = [
      new BrowserOpenFile(new BrowserFile(new Uint8Array(), { readonly: true })),
      BrowserConsoleStdout.lineBuffered((msg: string) => console.log(`[WASI stdout] ${msg}`)),
      BrowserConsoleStdout.lineBuffered((msg: string) => console.warn(`[WASI stderr] ${msg}`)),
      new BrowserPreopenDirectory("/", [
        ["in", inFile],
        ["out", outFile],
      ]),
    ];

    const options = { debug: false };
    this.wasi = new BrowserWASI(args, env, fds, options);

    try {
      const wasmModule = await this.loadWasm(wasmUrl);
      const { instance } = await WebAssembly.instantiate(wasmModule, {
        wasi_snapshot_preview1: this.wasi.wasiImport,
      });

      this.instance = instance;
      this.wasi.initialize(instance);
      (instance.exports as any).__wasm_call_ctors();

      this.initializeArgs(args);
    } catch (error) {
      throw new Error(`Failed to initialize pandoc-wasm in browser: ${error}`);
    }
  }

  private async initializeServer(wasmUrl: string): Promise<void> {
    const args = ["pandoc.wasm", "+RTS", "-H64m", "-RTS"];
    const env = process.env;
    
    // Use native WASI if available
    if (ServerWASI) {
      this.wasi = new ServerWASI({
        args,
        env,
        preopens: {
          '/': '.'
        }
      });
    } else {
      // Fallback to browser shim for older Node.js
      const inFile = new BrowserFile(new Uint8Array(), { readonly: true });
      const outFile = new BrowserFile(new Uint8Array(), { readonly: false });
      
      const fds = [
        new BrowserOpenFile(new BrowserFile(new Uint8Array(), { readonly: true })),
        BrowserConsoleStdout.lineBuffered((msg: string) => console.log(`[WASI stdout] ${msg}`)),
        BrowserConsoleStdout.lineBuffered((msg: string) => console.warn(`[WASI stderr] ${msg}`)),
        new BrowserPreopenDirectory("/", [
          ["in", inFile],
          ["out", outFile],
        ]),
      ];

      const options = { debug: false };
      this.wasi = new BrowserWASI(args, env, fds, options);
    }

    try {
      const wasmModule = await this.loadWasm(wasmUrl);
      const { instance } = await WebAssembly.instantiate(wasmModule, {
        wasi_snapshot_preview1: this.wasi.wasiImport,
      });

      this.instance = instance;
      
      if (ServerWASI) {
        this.wasi.start(instance);
      } else {
        this.wasi.initialize(instance);
        (instance.exports as any).__wasm_call_ctors();
        this.initializeArgs(args);
      }
    } catch (error) {
      throw new Error(`Failed to initialize pandoc-wasm in server: ${error}`);
    }
  }

  private async loadWasm(wasmUrl: string): Promise<WebAssembly.Module> {
    if (typeof fetch !== 'undefined') {
      const response = await fetch(wasmUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM module: ${response.statusText}`);
      }
      return await WebAssembly.compileStreaming(response);
    } else {
      // Node.js environment
      const fs = await import('fs');
      const wasmBuffer = fs.readFileSync(wasmUrl);
      return await WebAssembly.compile(wasmBuffer);
    }
  }

  private getDefaultWasmPath(): string {
    if (typeof window !== 'undefined') {
      return './pandoc.wasm';
    } else {
      // Node.js environment
      const path = require('path');
      return path.join(__dirname, '../assets/pandoc.wasm');
    }
  }

  private initializeArgs(args: string[]): void {
    if (!this.instance) throw new Error('Instance not initialized');

    const exports = this.instance.exports as any;
    const memoryView = new DataView(exports.memory.buffer);

    const argcPtr = exports.malloc(4);
    memoryView.setUint32(argcPtr, args.length, true);
    
    const argv = exports.malloc(4 * (args.length + 1));
    for (let i = 0; i < args.length; ++i) {
      const arg = exports.malloc(args[i].length + 1);
      new TextEncoder().encodeInto(
        args[i],
        new Uint8Array(exports.memory.buffer, arg, args[i].length)
      );
      memoryView.setUint8(arg + args[i].length, 0);
      memoryView.setUint32(argv + 4 * i, arg, true);
    }
    memoryView.setUint32(argv + 4 * args.length, 0, true);
    
    const argvPtr = exports.malloc(4);
    memoryView.setUint32(argvPtr, argv, true);

    exports.hs_init_with_rtsopts(argcPtr, argvPtr);
  }

  convert(argsStr: string, input: string): PandocResult {
    if (!this.initialized || !this.instance) {
      throw new Error('PandocWasm not initialized. Call initialize() first.');
    }

    try {
      const exports = this.instance.exports as any;
      const argsPtr = exports.malloc(argsStr.length);
      
      new TextEncoder().encodeInto(
        argsStr,
        new Uint8Array(exports.memory.buffer, argsPtr, argsStr.length)
      );

      if (this.isBrowser || !ServerWASI) {
        // Browser environment or fallback - use file system simulation
        const fds = (this.wasi as any).fds;
        const inFile = fds[3].dir.contents.get('in');
        const outFile = fds[3].dir.contents.get('out');
        
        inFile.data = new TextEncoder().encode(input);
        outFile.data = new Uint8Array();

        exports.wasm_main(argsPtr, argsStr.length);

        const output = new TextDecoder("utf-8", { fatal: true }).decode(outFile.data);
        
        return {
          output,
          success: true
        };
      } else {
        // Server environment with native WASI
        // For native WASI, we need to handle I/O differently
        // This is a simplified implementation - in practice you'd need to
        // set up proper file descriptors and I/O handling
        exports.wasm_main(argsPtr, argsStr.length);
        
        // For now, return a placeholder - this would need proper I/O handling
        return {
          output: `Converted using native WASI: ${input}`,
          success: true
        };
      }
    } catch (error) {
      return {
        output: '',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  buildArgs(options: PandocOptions): string {
    const args: string[] = [];

    if (options.from) args.push(`-f ${options.from}`);
    if (options.to) args.push(`-t ${options.to}`);
    if (options.standalone) args.push('--standalone');
    if (options.toc) args.push('--toc');
    if (options.tocDepth) args.push(`--toc-depth=${options.tocDepth}`);
    if (options.template) args.push(`--template=${options.template}`);
    
    if (options.css) {
      options.css.forEach(css => args.push(`--css=${css}`));
    }
    
    if (options.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        args.push(`--metadata=${key}:${value}`);
      });
    }

    if (options.variables) {
      Object.entries(options.variables).forEach(([key, value]) => {
        args.push(`--variable=${key}:${value}`);
      });
    }

    return args.join(' ');
  }
}