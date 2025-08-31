import { useState } from 'react';
import { Settings, Zap } from 'lucide-react';

interface ConvertFormProps {
  onConvert: (options: any) => void;
  isConverting: boolean;
}

export function ConvertForm({ onConvert, isConverting }: ConvertFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState({
    standalone: true,
    toc: false,
    tocDepth: 3,
    template: '',
    css: '',
    metadata: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConvert(options);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Options</h3>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Advanced</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.standalone}
            onChange={(e) => setOptions(prev => ({ ...prev, standalone: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Standalone document</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.toc}
            onChange={(e) => setOptions(prev => ({ ...prev, toc: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Table of contents</span>
        </label>
      </div>

      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg animate-slide-up">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TOC Depth
            </label>
            <input
              type="number"
              min="1"
              max="6"
              value={options.tocDepth}
              onChange={(e) => setOptions(prev => ({ ...prev, tocDepth: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSS File URL
            </label>
            <input
              type="text"
              value={options.css}
              onChange={(e) => setOptions(prev => ({ ...prev, css: e.target.value }))}
              placeholder="https://example.com/style.css"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metadata (key:value pairs, one per line)
            </label>
            <textarea
              value={options.metadata}
              onChange={(e) => setOptions(prev => ({ ...prev, metadata: e.target.value }))}
              placeholder="title:My Document&#10;author:John Doe"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isConverting}
        className="button-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Zap className="w-5 h-5" />
        <span>{isConverting ? 'Converting...' : 'Convert Document'}</span>
      </button>
    </form>
  );
}