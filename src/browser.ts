import { PandocWasm } from './core/pandoc-wasm';
import { ConvertOptions, PandocResult } from './types/index';

export class BrowserPandoc extends PandocWasm {
  async initialize(wasmUrl = './pandoc.wasm'): Promise<void> {
    await super.initialize(wasmUrl);
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