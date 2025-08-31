import {
  WASI,
  OpenFile,
  File,
  ConsoleStdout,
  PreopenDirectory,
} from '@bjorn3/browser_wasi_shim';
import { PandocOptions, ConvertOptions, PandocResult } from './types/index';

export class BrowserPandoc {
  private instance: WebAssembly.Instance | null = null;
  private wasi: WASI | null = null;
  private initialized = false;

  async initialize(wasmUrl = './pandoc.wasm'): Promise<void> {
    if (this.initialized) return;

    const args = ["pandoc.wasm", "+RTS", "-H64m", "-RTS"];
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
    this.wasi = new WASI(args, env, fds, options);

    try {
      const response = await fetch(wasmUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM module: ${response.statusText}`);
      }
      
      const wasmModule = await WebAssembly.compileStreaming(response);
      const { instance } = await WebAssembly.instantiate(wasmModule, {
        wasi_snapshot_preview1: this.wasi.wasiImport,
      });

      this.instance = instance;
      this.wasi.initialize(instance);
      (instance.exports as any).__wasm_call_ctors();

      this.initializeArgs(args);
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize pandoc-wasm in browser: ${error}`);
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

      // Set input data using browser WASI shim
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

export async function createBrowserInstance(wasmUrl?: string): Promise<BrowserPandoc> {
  const instance = new BrowserPandoc();
  await instance.initialize(wasmUrl);
  return instance;
}

export async function convertInBrowser(
  input: string,
  options: ConvertOptions = {},
  wasmUrl?: string
): Promise<PandocResult> {
  const instance = await createBrowserInstance(wasmUrl);
  const argsStr = instance.buildArgs(options);
  return instance.convert(argsStr, input);
}

export { PandocOptions, ConvertOptions, PandocResult } from './types/index';