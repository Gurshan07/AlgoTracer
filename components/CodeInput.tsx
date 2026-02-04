import React from 'react';

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  activeLine?: number; // 1-based index
  readOnly?: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = ({ code, setCode, activeLine, readOnly }) => {
  const lines = code.split('\n');

  return (
    <div className="relative font-mono text-sm bg-gray-950 rounded-lg overflow-hidden border border-gray-700 h-full flex flex-col">
      <div className="absolute top-0 left-0 bottom-0 w-10 bg-gray-900 border-r border-gray-800 text-gray-600 flex flex-col items-end py-4 pr-2 select-none z-10">
        {lines.map((_, i) => (
          <div key={i} className="leading-6 h-6">{i + 1}</div>
        ))}
      </div>
      
      <div className="flex-1 relative overflow-auto pl-10 pt-4 pb-4">
         {/* Highlight Overlay */}
         {activeLine !== undefined && activeLine > 0 && (
            <div 
              className="absolute left-0 right-0 bg-yellow-500/20 border-l-2 border-yellow-500 pointer-events-none transition-all duration-200"
              style={{ 
                top: `${(activeLine - 1) * 1.5 + 1}rem`, // 1.5rem is leading-6 (24px)
                height: '1.5rem',
                width: '100%'
              }}
            />
         )}

         {/* Editor Area */}
         {readOnly ? (
           <pre className="m-0 p-0 text-gray-300 font-mono leading-6 pl-2">
             {lines.map((line, i) => (
               <div key={i} className="h-6 whitespace-pre">{line}</div>
             ))}
           </pre>
         ) : (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-transparent text-gray-300 p-0 pl-2 outline-none resize-none leading-6 whitespace-pre font-mono"
            spellCheck={false}
            placeholder="// Paste your function here..."
          />
         )}
      </div>
    </div>
  );
};
