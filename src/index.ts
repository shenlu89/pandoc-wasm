export { PandocWasm } from './core/pandoc-wasm';
export { convertFile, convert } from './api/convert';
export * from './types/index';

// Default export for convenience
import { PandocWasm } from './core/pandoc-wasm';
export default PandocWasm;