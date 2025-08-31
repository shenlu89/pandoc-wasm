export interface PandocOptions {
  from?: string;
  to?: string;
  standalone?: boolean;
  toc?: boolean;
  tocDepth?: number;
  template?: string;
  css?: string[];
  include?: string[];
  metadata?: Record<string, any>;
  variables?: Record<string, string>;
  filters?: string[];
  luaFilters?: string[];
  extensions?: string[];
  [key: string]: any;
}

export interface ConvertOptions extends PandocOptions {
  inputFile?: string;
  outputFile?: string;
  args?: string[];
}

export interface PandocResult {
  output: string;
  success: boolean;
  error?: string;
}

export interface FileConvertOptions {
  deleteInput?: boolean;
  createDir?: boolean;
}

export type SupportedFormat = 
  | 'markdown' | 'html' | 'latex' | 'docx' | 'pdf' | 'epub'
  | 'rst' | 'textile' | 'org' | 'mediawiki' | 'dokuwiki'
  | 'json' | 'native' | 'plain' | 'rtf' | 'odt' | 'pptx';