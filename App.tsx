import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Pause, Zap, Code2, Terminal } from 'lucide-react';
import { analyzeCode } from './services/puterService';
import { SAMPLE_CODE } from './constants';
import { CodeInput } from './components/CodeInput';
import { Visualizer } from './components/Visualizer';
import { AnalysisResult } from './types';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(SAMPLE_CODE);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setIsPlaying(false);
    setCurrentStep(0);
    
    try {
      const result = await analyzeCode(code);
      if (result.error) {
        setError(result.error);
      } else {
        setAnalysis(result);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!analysis) return;
    setIsPlaying(!isPlaying);
  };

  const stepForward = () => {
    if (!analysis) return;
    setCurrentStep(prev => Math.min(prev + 1, analysis.steps.length - 1));
  };

  const stepBackward = () => {
    if (!analysis) return;
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (isPlaying && analysis) {
      timerRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= analysis.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000); // 1 second per step
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, analysis]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg shadow-lg shadow-purple-900/50">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Algo<span className="text-purple-400">Tracer</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => window.open('https://puter.com', '_blank')}
             className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
           >
             Powered by Puter.js
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Panel: Code Input */}
        <div className="w-full lg:w-1/3 flex flex-col border-r border-gray-800 bg-gray-900/50">
          <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
              <Code2 size={16} /> Source Code
            </h2>
            <div className="flex gap-2">
               <button 
                onClick={() => setCode(SAMPLE_CODE)}
                className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 transition-colors"
              >
                Load Sample
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-hidden">
            <CodeInput 
              code={code} 
              setCode={setCode} 
              readOnly={loading || isPlaying} 
              activeLine={analysis?.steps[currentStep]?.line}
            />
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`
                w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all
                ${loading 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/25'}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Analyzing...
                </span>
              ) : (
                "Trace & Visualize"
              )}
            </button>
             {error && (
              <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-xs">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Visualization */}
        <div className="w-full lg:w-2/3 flex flex-col bg-gray-950 relative">
          
          {/* Viz Controls Toolbar */}
          <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={reset}
                disabled={!analysis}
                className="p-2 rounded-full hover:bg-gray-800 text-gray-400 disabled:opacity-30 transition-colors"
                title="Reset"
              >
                <RotateCcw size={18} />
              </button>
              
              <div className="h-6 w-px bg-gray-700 mx-2"></div>

              <button 
                onClick={stepBackward}
                disabled={!analysis || currentStep === 0}
                className="p-2 rounded-full hover:bg-gray-800 text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <button 
                onClick={togglePlay}
                disabled={!analysis}
                className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-lg shadow-white/10"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>

              <button 
                onClick={stepForward}
                disabled={!analysis || currentStep >= (analysis.steps.length - 1)}
                className="p-2 rounded-full hover:bg-gray-800 text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex flex-col items-end">
               <span className="text-xs text-gray-500 font-mono uppercase">Status</span>
               <span className={`text-sm font-bold ${analysis ? 'text-green-400' : 'text-gray-600'}`}>
                 {analysis ? (isPlaying ? 'Running' : 'Paused') : 'Idle'}
               </span>
            </div>
          </div>

          {/* Viz Workspace */}
          <div className="flex-1 p-6 overflow-hidden relative">
            {!analysis && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 opacity-50 pointer-events-none">
                 <Terminal size={64} className="mb-4 text-gray-700" />
                 <p className="text-lg font-medium">No execution trace available</p>
                 <p className="text-sm">Write code and click "Trace" to begin</p>
              </div>
            )}
            
            {loading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 z-50">
                  <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-700 h-12 w-12 mb-4"></div>
                  <p className="text-purple-400 animate-pulse font-mono">Simulating Logic via Puter AI...</p>
               </div>
            )}

            {analysis && (
              <Visualizer analysis={analysis} currentStepIndex={currentStep} />
            )}
          </div>
          
          {/* Progress Bar */}
          {analysis && (
            <div className="h-1 bg-gray-800 w-full relative">
              <div 
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / analysis.steps.length) * 100}%` }}
              ></div>
            </div>
          )}
        </div>

      </main>
      
      <style>{`
        .loader {
          border-top-color: #a855f7;
          animation: spinner 1.5s linear infinite;
        }
        @keyframes spinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;