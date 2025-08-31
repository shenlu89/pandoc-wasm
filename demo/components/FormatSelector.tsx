import { ChevronDown } from 'lucide-react';

interface FormatSelectorProps {
  fromFormat: string;
  toFormat: string;
  onFromChange: (format: string) => void;
  onToChange: (format: string) => void;
}

const INPUT_FORMATS = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'latex', label: 'LaTeX' },
  { value: 'rst', label: 'reStructuredText' },
  { value: 'org', label: 'Org Mode' },
  { value: 'textile', label: 'Textile' },
  { value: 'mediawiki', label: 'MediaWiki' },
  { value: 'docx', label: 'Word Document' },
  { value: 'epub', label: 'EPUB' },
  { value: 'json', label: 'Pandoc JSON' }
];

const OUTPUT_FORMATS = [
  { value: 'html', label: 'HTML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'latex', label: 'LaTeX' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'Word Document' },
  { value: 'epub', label: 'EPUB' },
  { value: 'rst', label: 'reStructuredText' },
  { value: 'org', label: 'Org Mode' },
  { value: 'plain', label: 'Plain Text' },
  { value: 'json', label: 'Pandoc JSON' }
];

export function FormatSelector({ fromFormat, toFormat, onFromChange, onToChange }: FormatSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
        <div className="relative">
          <select
            value={fromFormat}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {INPUT_FORMATS.map(format => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex justify-center">
        <div className="hidden md:flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
        <div className="relative">
          <select
            value={toFormat}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {OUTPUT_FORMATS.map(format => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}