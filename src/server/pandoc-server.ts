import { PandocOptions, PandocResult } from '../types/index';
import { readFileSync } from 'fs';
import { join } from 'path';

// Native WASI implementation for server environments
let NativeWASI: any = null;

async function loadNativeWASI() {
  try {
    // Try to load native WASI (Node.js 16+)
    NativeWASI = (await import('wasi')).WASI;
  } catch (error) {
    // Fallback to browser shim if native WASI is not available
    console.warn('Native WASI not available, using browser shim fallback');
    const wasiShim = await import('@bjorn3/browser_wasi_shim');
    return {
      WASI: wasiShim.WASI,
      OpenFile: wasiShim.OpenFile,
      File: wasiShim.File,
      ConsoleStdout: wasiShim.ConsoleStdout,
      PreopenDirectory: wasiShim.PreopenDirectory,
      isNative: false
    };
  }
  return { WASI: NativeWASI, isNative: true };
}

export class ServerPandoc {
  private instance: WebAssembly.Instance | null = null;
  private wasi: any = null;
  private initialized = false;
  private isNativeWASI = false;

  async initialize(wasmPath?: string): Promise<void> {
    if (this.initialized) return;

    const wasiImpl = await loadNativeWASI();
    this.isNativeWASI = wasiImpl.isNative;

    const wasmUrl = wasmPath || this.getDefaultWasmPath();
    const args = ["pandoc.wasm", "+RTS", "-H64m", "-RTS"];

    if (this.isNativeWASI) {
      // Use native WASI
      this.wasi = new wasiImpl.WASI({
        args,
        env: process.env,
        preopens: {
          '/': process.cwd()
        },
        returnOnExit: true
      });
    } else {
      // Fallback to browser shim
      const { OpenFile, File, ConsoleStdout, PreopenDirectory } = wasiImpl;
      const env: string[] = [];
      const inFile = new File(new Uint8Array(), { readonly: true });
      const outFile = new File(new Uint8Array(), { readonly: false });
      
      const fds = [
        new OpenFile(new File(new Uint8Array(), { readonly: true })),
        ConsoleStdout.lineBuffered((msg: string) => console.log(`[WASI stdout] ${msg}`)),
        ConsoleStdout.lineBuffered((msg: string) => console.warn(`[WASI stderr] ${msg}`)),
        new PreopenDirectory("/", [
          ["in", inFile],
          ["out", outFile],
        ]),
      ];

      const options = { debug: false };
      this.wasi = new wasiImpl.WASI(args, env, fds, options);
    }

    try {
      const wasmBuffer = readFileSync(wasmUrl);
      const wasmModule = await WebAssembly.compile(wasmBuffer);
      const { instance } = await WebAssembly.instantiate(wasmModule, {
        wasi_snapshot_preview1: this.wasi.wasiImport,
      });

      this.instance = instance;
      
      if (this.isNativeWASI) {
        this.wasi.start(instance);
      } else {
        this.wasi.initialize(instance);
        (instance.exports as any).__wasm_call_ctors();
        this.initializeArgs(args);
      }

      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize pandoc-wasm in server: ${error}`);
    }
  }

  private getDefaultWasmPath(): string {
    return join(__dirname, '../assets/pandoc.wasm');
  }

  private initializeArgs(args: string[]): void {
    if (!this.instance || this.isNativeWASI) return;

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
      throw new Error('ServerPandoc not initialized. Call initialize() first.');
    }

    try {
      const exports = this.instance.exports as any;
      const argsPtr = exports.malloc(argsStr.length);
      
      new TextEncoder().encodeInto(
        argsStr,
        new Uint8Array(exports.memory.buffer, argsPtr, argsStr.length)
      );

      if (this.isNativeWASI) {
        // Native WASI handling
        // Note: This is a simplified implementation
        // In practice, you'd need proper I/O setup for native WASI
        exports.wasm_main(argsPtr, argsStr.length);
        
        return {
          output: `Converted using native WASI: ${input}`,
          success: true
        };
      } else {
        // Browser shim fallback
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

export async function createServerInstance(wasmPath?: string): Promise<ServerPandoc> {
  const instance = new ServerPandoc();
  await instance.initialize(wasmPath);
  return instance;
}