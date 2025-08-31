export const INPUT_FORMATS = [
  'commonmark', 'creole', 'csv', 'docbook', 'docx', 'dokuwiki', 'epub',
  'fb2', 'gfm', 'haddock', 'html', 'ipynb', 'jats', 'jira', 'json',
  'latex', 'man', 'markdown', 'markdown_github', 'markdown_mmd',
  'markdown_phpextra', 'markdown_strict', 'mediawiki', 'muse', 'native',
  'odt', 'opml', 'org', 'rst', 'rtf', 't2t', 'textile', 'tikiwiki',
  'twiki', 'vimwiki'
] as const;

export const OUTPUT_FORMATS = [
  'asciidoc', 'asciidoctor', 'beamer', 'commonmark', 'context', 'docbook',
  'docbook4', 'docbook5', 'docx', 'dokuwiki', 'dzslides', 'epub', 'epub2',
  'epub3', 'fb2', 'gfm', 'haddock', 'html', 'html4', 'html5', 'icml',
  'ipynb', 'jats', 'jira', 'json', 'latex', 'man', 'markdown',
  'markdown_github', 'markdown_mmd', 'markdown_phpextra', 'markdown_strict',
  'mediawiki', 'ms', 'muse', 'native', 'odt', 'opendocument', 'opml',
  'org', 'pdf', 'plain', 'pptx', 'revealjs', 'rst', 'rtf', 's5',
  'slideous', 'slidy', 'tei', 'texinfo', 'textile', 'zimwiki'
] as const;

export type InputFormat = typeof INPUT_FORMATS[number];
export type OutputFormat = typeof OUTPUT_FORMATS[number];

export function isValidInputFormat(format: string): format is InputFormat {
  return INPUT_FORMATS.includes(format as InputFormat);
}

export function isValidOutputFormat(format: string): format is OutputFormat {
  return OUTPUT_FORMATS.includes(format as OutputFormat);
}