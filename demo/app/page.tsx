'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileText, Download, Upload, Zap, Github, BookOpen } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { ConvertForm } from '@/components/ConvertForm';
import { OutputDisplay } from '@/components/OutputDisplay';
import { FormatSelector } from '@/components/FormatSelector';
import { ConversionHistory } from '@/components/ConversionHistory';

interface ConversionRecord {
  id: string;
  input: string;
  output: string;
  from: string;
  to: string;
  timestamp: Date;
  filename?: string;
}

export default function Home() {
  const [input, setInput] = useState('# Welcome to Pandoc WASM\n\nThis is a **markdown** document that will be converted to other formats.\n\n## Features\n\n- Fast WebAssembly-based conversion\n- Multiple input/output formats\n- Browser and Node.js support\n- CLI tool included\n\n> Try changing the output format to see the magic happen!');
  const [output, setOutput] = useState('');
  const [fromFormat, setFromFormat] = useState('markdown');
  const [toFormat, setToFormat] = useState('html');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionRecord[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
        
        // Auto-detect format based on file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'md') setFromFormat('markdown');
        else if (extension === 'html') setFromFormat('html');
        else if (extension === 'rst') setFromFormat('rst');
        else if (extension === 'tex') setFromFormat('latex');
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.md', '.txt', '.html', '.rst', '.tex', '.org']
    },
    multiple: false
  });

  const handleConvert = async () => {
    if (!input.trim()) return;

    setIsConverting(true);
    setError(null);

    try {
      // Simulate conversion (replace with actual pandoc-wasm call)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let convertedOutput = '';
      
      if (fromFormat === 'markdown' && toFormat === 'html') {
        convertedOutput = `<!DOCTYPE html>
<html>
<head>
  <title>Converted Document</title>
</head>
<body>
${input.replace(/^# (.+)$/gm, '<h1>$1</h1>')
       .replace(/^## (.+)$/gm, '<h2>$1</h2>')
       .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
       .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
       .replace(/^- (.+)$/gm, '<li>$1</li>')
       .replace(/\n\n/g, '</p><p>')
       .replace(/^(?!<[h|l|b])(.+)$/gm, '<p>$1</p>')}
</body>
</html>`;
      } else {
        convertedOutput = `Converted from ${fromFormat} to ${toFormat}:\n\n${input}`;
      }

      setOutput(convertedOutput);
      
      // Add to history
      const record: ConversionRecord = {
        id: Date.now().toString(),
        input: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
        output: convertedOutput.substring(0, 100) + (convertedOutput.length > 100 ? '...' : ''),
        from: fromFormat,
        to: toFormat,
        timestamp: new Date()
      };
      
      setHistory(prev => [record, ...prev.slice(0, 9)]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    if (input.trim()) {
      const timeoutId = setTimeout(handleConvert, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [input, fromFormat, toFormat]);

  const downloadOutput = () => {
    if (!output) return;
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${toFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pandoc WASM</h1>
                <p className="text-sm text-gray-600">Universal document converter</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/your-username/pandoc-wasm-cli"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a
                href="https://pandoc.org/MANUAL.html"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                <span>Docs</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>Powered by WebAssembly</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Convert Documents Instantly
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your documents between multiple formats using the power of Pandoc compiled to WebAssembly.
            No server required - everything runs in your browser.
          </p>
        </div>

        {/* Format Selection */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Format Selection</h3>
          <FormatSelector
            fromFormat={fromFormat}
            toFormat={toFormat}
            onFromChange={setFromFormat}
            onToChange={setToFormat}
          />
        </div>

        {/* Main Conversion Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Input</h3>
              <div className="flex items-center space-x-2">
                <div
                  {...getRootProps()}
                  className={`cursor-pointer p-2 rounded-lg transition-colors ${
                    isDragActive 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div
              {...getRootProps()}
              className={`relative ${isDragActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
            >
              <input {...getInputProps()} />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-96 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder={`Enter your ${fromFormat} content here or drag & drop a file...`}
              />
              {isDragActive && (
                <div className="absolute inset-0 bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-blue-700 font-medium">Drop your file here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Output</h3>
              <div className="flex items-center space-x-2">
                {isConverting && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Converting...</span>
                  </div>
                )}
                {output && (
                  <button
                    onClick={downloadOutput}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                    title="Download output"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            <OutputDisplay
              output={output}
              format={toFormat}
              error={error}
              isConverting={isConverting}
            />
          </div>
        </div>

        {/* Conversion History */}
        {history.length > 0 && (
          <div className="glass-effect rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversions</h3>
            <ConversionHistory 
              history={history} 
              onSelect={(record) => {
                setInput(record.input);
                setFromFormat(record.from);
                setToFormat(record.to);
              }}
            />
          </div>
        )}

        {/* Installation Instructions */}
        <div className="glass-effect rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Installation & Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">CLI Installation</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <div className="text-green-400"># Install globally</div>
                <div>npm install -g pandoc-wasm-cli</div>
                <div className="mt-2 text-green-400"># Use anywhere</div>
                <div>pandoc-wasm -f markdown -t html input.md</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">API Usage</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <div className="text-blue-400">import</div> pandoc <div className="text-blue-400">from</div> <div className="text-green-400">'pandoc-wasm-cli'</div>;
                <div className="mt-2"></div>
                <div className="text-blue-400">const</div> result = <div className="text-blue-400">await</div> pandoc.convert(input, {'{'}
                <div>  from: <div className="text-green-400">'markdown'</div>,</div>
                <div>  to: <div className="text-green-400">'html'</div></div>
                <div>{'}'});</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}