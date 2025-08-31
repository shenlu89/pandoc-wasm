import { PandocWasm } from '../core/pandoc-wasm';
import { ConvertOptions, PandocResult, FileConvertOptions } from '../types/index';

let globalInstance: PandocWasm | null = null;

async function getInstance(): Promise<PandocWasm> {
  if (!globalInstance) {
    globalInstance = new PandocWasm();
    await globalInstance.initialize();
  }
  return globalInstance;
}

export async function convert(
  input: string, 
  options: ConvertOptions = {}
): Promise<PandocResult> {
  const instance = await getInstance();
  
  const argsStr = instance.buildArgs(options);
  return instance.convert(argsStr, input);
}

export async function convertFile(
  inputPath: string,
  outputPath: string,
  options: ConvertOptions & FileConvertOptions = {}
): Promise<PandocResult> {
  if (typeof window !== 'undefined') {
    throw new Error('File operations are not supported in browser environment');
  }

  const fs = await import('fs');
  const path = await import('path');

  try {
    // Read input file
    const input = fs.readFileSync(inputPath, 'utf-8');
    
    // Convert
    const result = await convert(input, options);
    
    if (result.success) {
      // Create output directory if needed
      if (options.createDir) {
        const outputDir = path.dirname(outputPath);
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Write output file
      fs.writeFileSync(outputPath, result.output);
      
      // Delete input file if requested
      if (options.deleteInput) {
        fs.unlinkSync(inputPath);
      }
    }
    
    return result;
  } catch (error) {
    return {
      output: '',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}