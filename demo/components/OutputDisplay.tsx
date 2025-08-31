import { AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface OutputDisplayProps {
  output: string;
  format: string;
  error: string | null;
  isConverting: boolean;
}

export function OutputDisplay({ output, format, error, isConverting }: OutputDisplayProps) {
  if (error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-red-900 mb-2">Conversion Error</h4>
          <p className="text-red-700 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  if (isConverting) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Converting document...</p>
        </div>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Output will appear here after conversion</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Conversion successful</span>
      </div>
      
      {format === 'html' ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div 
              className="border border-gray-200 rounded-lg p-4 bg-white max-h-64 overflow-auto"
              dangerouslySetInnerHTML={{ __html: output }}
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">HTML Source</h4>
            <textarea
              value={output}
              readOnly
              className="w-full h-32 p-4 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50 resize-none"
            />
          </div>
        </div>
      ) : (
        <textarea
          value={output}
          readOnly
          className="w-full h-96 p-4 border border-gray-200 rounded-lg resize-none font-mono text-sm bg-gray-50"
          placeholder="Converted output will appear here..."
        />
      )}
    </div>
  );
}