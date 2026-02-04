import React from 'react';
import { AnalysisResult, Step } from '../types';
import { Box, Braces, Layers, Hash, CircleDot } from 'lucide-react';

interface VisualizerProps {
  analysis: AnalysisResult;
  currentStepIndex: number;
}

// Recursive component to render objects and nested structures
const ObjectNode = ({ data, name, depth = 0 }: { data: any; name?: string; depth?: number }) => {
  if (data === null) return <span className="text-gray-500 italic">null</span>;
  if (data === undefined) return <span className="text-gray-500 italic">undefined</span>;
  
  // Base case: Primitive
  if (typeof data !== 'object') {
     return <span className="text-green-400 font-mono">{String(data)}</span>;
  }

  // Prevent infinite or too deep recursion
  if (depth > 2) return <span className="text-gray-500 text-xs font-mono">{'{ ... }'}</span>;

  const entries = Object.entries(data);
  if (entries.length === 0) return <span className="text-gray-500 font-mono">{'{}'}</span>;

  return (
    <div className={`
      inline-block bg-gray-900/50 border border-gray-700 rounded p-2 min-w-[140px] align-top
      ${depth > 0 ? 'mt-1' : 'shadow-sm'}
    `}>
      {name && (
        <div className="text-xs text-pink-400 font-bold mb-2 border-b border-gray-700 pb-1 font-mono flex items-center gap-1">
          {depth === 0 && <CircleDot size={10} />}
          {name}
        </div>
      )}
      <div className="flex flex-col gap-1.5 text-xs font-mono">
        {entries.map(([k, v]) => (
          <div key={k} className="flex gap-2 items-start justify-between">
             <span className="text-blue-300 font-semibold opacity-90">{k}:</span>
             <div className="text-right">
               <ObjectNode data={v} depth={depth + 1} />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Visualizer: React.FC<VisualizerProps> = ({ analysis, currentStepIndex }) => {
  const currentStep: Step = analysis.steps[currentStepIndex];
  
  // Safe access to state
  const variables = currentStep?.state?.variables || {};
  const dataStructures = currentStep?.state?.dataStructures || { 
    arrays: {}, linkedLists: [], stacks: [], queues: [], trees: [], graphs: [] 
  };
  const arrays = dataStructures.arrays || {};

  // Group variables into primitives and objects
  const primitiveVars: Record<string, any> = {};
  const objectVars: Record<string, any> = {};

  Object.entries(variables).forEach(([k, v]) => {
     // If it's a known array, don't show in variables list
     if (arrays && Object.keys(arrays).includes(k)) return;
     
     if (typeof v === 'object' && v !== null) {
        objectVars[k] = v;
     } else {
        primitiveVars[k] = v;
     }
  });

  // Collect other data structures if they exist and are populated
  // We filter out empty arrays to avoid clutter
  const otherStructures = [
    { name: 'Linked Lists', data: dataStructures.linkedLists },
    { name: 'Trees', data: dataStructures.trees },
    { name: 'Stacks', data: dataStructures.stacks },
    { name: 'Queues', data: dataStructures.queues },
    { name: 'Graphs', data: dataStructures.graphs },
  ].filter(item => item.data && Array.isArray(item.data) && item.data.length > 0);

  // Identify active indices for array highlighting (heuristic based on variable names)
  const activeIndices: Record<string, number[]> = {};
  Object.entries(primitiveVars).forEach(([key, value]) => {
    if (['i', 'j', 'k', 'l', 'r', 'mid', 'low', 'high', 'p', 'q'].includes(key) && typeof value === 'number') {
       Object.keys(arrays).forEach(arrName => {
         if (!activeIndices[arrName]) activeIndices[arrName] = [];
         activeIndices[arrName].push(value);
       });
    }
  });

  return (
    <div className="flex flex-col h-full gap-6 overflow-y-auto pr-2 pb-10 custom-scrollbar">
      
      {/* Step Description */}
      <div className="bg-gray-850 p-4 rounded-lg border border-gray-700 shadow-sm animate-fade-in shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-600 text-xs font-bold px-2 py-0.5 rounded text-white uppercase tracking-wider">
            {currentStep?.action || 'Init'}
          </span>
          <span className="text-gray-400 text-xs font-mono">Step {currentStepIndex + 1} / {analysis.steps.length}</span>
        </div>
        <p className="text-lg font-medium text-gray-100">
          {currentStep?.description || "Ready to start execution."}
        </p>
      </div>

      {/* Arrays Visualization */}
      {Object.keys(arrays).length > 0 && (
        <div className="space-y-4 shrink-0">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Box size={16} /> Arrays
            </h3>
            {Object.entries(arrays).map(([name, data]) => (
            <div key={name} className="bg-gray-850 p-4 rounded-lg border border-gray-700 overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                <span className="font-mono text-purple-400 font-bold">{name}</span>
                <span className="text-xs text-gray-500">Array[{Array.isArray(data) ? data.length : 0}]</span>
                </div>
                
                <div className="flex items-end gap-2 pb-6 min-w-max">
                {Array.isArray(data) && data.map((val, idx) => {
                    const isHighlight = activeIndices[name]?.includes(idx);
                    const variablePointer = Object.entries(primitiveVars).find(([k, v]) => 
                        ['i', 'j', 'k', 'mid', 'low', 'high'].includes(k) && v === idx
                    );

                    return (
                    <div key={idx} className="relative flex flex-col items-center group">
                        <div className={`
                        w-12 h-12 flex items-center justify-center border-2 rounded transition-all duration-300
                        ${isHighlight 
                            ? 'border-blue-500 bg-blue-900/30 text-blue-200 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                            : 'border-gray-600 bg-gray-800 text-gray-300'}
                        font-mono font-bold text-lg z-10
                        `}>
                        {val}
                        </div>
                        <span className="mt-2 text-xs text-gray-500 font-mono">{idx}</span>
                        {variablePointer && (
                        <div className="absolute -top-8 flex flex-col items-center animate-bounce">
                            <span className="text-xs font-bold text-yellow-400 font-mono bg-yellow-400/10 px-1 rounded">
                            {variablePointer[0]}
                            </span>
                            <div className="w-0.5 h-2 bg-yellow-400/50"></div>
                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-yellow-400/50"></div>
                        </div>
                        )}
                    </div>
                    );
                })}
                </div>
            </div>
            ))}
        </div>
      )}
      
      {/* Objects & Class Instances */}
      {Object.keys(objectVars).length > 0 && (
        <div className="space-y-4 shrink-0">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Hash size={16} /> Objects & Classes
            </h3>
            <div className="flex flex-wrap gap-4 p-1">
                {Object.entries(objectVars).map(([name, data]) => (
                    <div key={name} className="bg-gray-850 rounded-lg border border-gray-700 shadow-md overflow-hidden">
                       <div className="bg-gray-800/50 px-3 py-1 border-b border-gray-700 flex justify-between items-center">
                          <span className="text-xs font-mono text-gray-400">Variable</span>
                       </div>
                       <div className="p-3">
                          <ObjectNode name={name} data={data} />
                       </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Complex Data Structures (Linked Lists, Trees, etc) */}
      {otherStructures.length > 0 && (
         <div className="space-y-4 shrink-0">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} /> Data Structures
            </h3>
            {otherStructures.map((struct, idx) => (
                <div key={idx} className="bg-gray-850 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-xs text-gray-500 uppercase mb-3 font-bold border-b border-gray-700 pb-2">
                      {struct.name}
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        {struct.data.map((item: any, i: number) => (
                             <ObjectNode key={i} data={item} name={`${struct.name.slice(0, -1)} ${i + 1}`} />
                        ))}
                    </div>
                </div>
            ))}
         </div>
      )}

      {/* Variables & Call Stack Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
        
        {/* Primitive Variables */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Braces size={16} /> Primitive Variables
          </h3>
          <div className="bg-gray-850 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-800 text-gray-400 font-mono text-xs">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 font-mono">
                {Object.entries(primitiveVars).map(([key, val]) => (
                    <tr key={key} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-2 text-pink-400">{key}</td>
                      <td className="px-4 py-2 text-green-400">
                        {String(val)}
                      </td>
                    </tr>
                ))}
                {Object.keys(primitiveVars).length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-gray-500 italic">
                      No primitive variables
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Complexity & Stack */}
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-800 to-gray-850 p-4 rounded-lg border border-gray-700">
              <h4 className="text-xs text-gray-500 uppercase font-bold mb-2">Complexity Analysis</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Time</div>
                  <div className="text-lg font-mono font-bold text-white">{analysis.complexity?.time || "N/A"}</div>
                </div>
                <div className="w-px bg-gray-700"></div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Space</div>
                  <div className="text-lg font-mono font-bold text-white">{analysis.complexity?.space || "N/A"}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
               <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} /> Call Stack
              </h3>
              <div className="bg-gray-850 p-3 rounded border border-gray-700 text-sm font-mono text-gray-300 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 {analysis.callStack?.[0]?.function || 'main'}
                 <span className="text-gray-500 text-xs ml-auto">Active Frame</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};