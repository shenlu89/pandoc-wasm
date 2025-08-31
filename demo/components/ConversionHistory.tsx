import { Clock, ArrowRight } from 'lucide-react';

interface ConversionRecord {
  id: string;
  input: string;
  output: string;
  from: string;
  to: string;
  timestamp: Date;
  filename?: string;
}

interface ConversionHistoryProps {
  history: ConversionRecord[];
  onSelect: (record: ConversionRecord) => void;
}

export function ConversionHistory({ history, onSelect }: ConversionHistoryProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-3">
      {history.map((record) => (
        <div
          key={record.id}
          onClick={() => onSelect(record)}
          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatTime(record.timestamp)}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm font-medium">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {record.from}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                {record.to}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 truncate">
                {record.input}
              </p>
            </div>
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Use this
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}