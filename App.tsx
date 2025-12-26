
import React, { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { generateSpriteImage, refineSpritePrompt } from './services/geminiService';
import PreviewAnimator from './components/PreviewAnimator';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [spriteSheet, setSpriteSheet] = useState<string | null>(null);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(4);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);
    try {
      const refined = await refineSpritePrompt(prompt);
      // Now passing rows and cols to the service so Gemini knows the desired grid
      const imageUrl = await generateSpriteImage(refined, rows, cols, "1:1");
      setSpriteSheet(imageUrl);
      setHistory(prev => [imageUrl, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate sprite');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!spriteSheet) return;
    const link = document.createElement('a');
    link.href = spriteSheet;
    link.download = `sprite-sheet-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Lucide.Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              SpriteStudio AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs text-slate-400 font-mono hidden md:inline-block">Gemini 2.5 Flash Engine</span>
             <button 
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
             >
               <Lucide.RotateCcw className="w-4 h-4 text-slate-400" />
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Lucide.Sparkles className="w-4 h-4 text-indigo-400" />
              Generation Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Character Idea</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A cybernetic rogue walking cycle, 16-bit pixel art style..."
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-500">Rows</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range"
                      min="1"
                      max="8"
                      value={rows}
                      onChange={(e) => setRows(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-xs font-mono w-4">{rows}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-500">Columns</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range"
                      min="1"
                      max="12"
                      value={cols}
                      onChange={(e) => setCols(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-xs font-mono w-4">{cols}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isGenerating 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Lucide.Loader2 className="w-4 h-4 animate-spin" />
                    Baking Sprites...
                  </>
                ) : (
                  <>
                    <Lucide.Zap className="w-4 h-4 fill-current" />
                    Generate Sprite Sheet
                  </>
                )}
              </button>
            </div>
          </section>

          <PreviewAnimator 
            imageSrc={spriteSheet} 
            rows={rows} 
            cols={cols} 
          />
        </aside>

        {/* Main Canvas Area */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col relative overflow-hidden shadow-2xl">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Lucide.ImageIcon className="w-4 h-4" />
                <span>WORKSPACE / {rows}x{cols}_GRID</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={downloadImage}
                  disabled={!spriteSheet}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  title="Download Sheet"
                >
                  <Lucide.Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewport */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-950 pixel-bg relative overflow-auto">
              {isGenerating ? (
                <div className="text-center animate-pulse">
                  <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 font-mono text-sm">Visualizing character frames...</p>
                </div>
              ) : spriteSheet ? (
                <div className="relative group inline-block">
                  <img 
                    src={spriteSheet} 
                    alt="Generated Sprite Sheet" 
                    className="max-h-[65vh] object-contain shadow-2xl rounded border border-slate-700 bg-white"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {/* Grid Overlay - Updates instantly with the range sliders */}
                  <div 
                    className="absolute inset-0 pointer-events-none grid opacity-0 group-hover:opacity-40 transition-opacity"
                    style={{
                      gridTemplateColumns: `repeat(${cols}, 1fr)`,
                      gridTemplateRows: `repeat(${rows}, 1fr)`,
                    }}
                  >
                    {Array.from({ length: rows * cols }).map((_, i) => (
                      <div key={i} className="border-[1px] border-indigo-500 box-border" />
                    ))}
                  </div>
                  {/* Helper labels */}
                  <div className="absolute -top-6 left-0 text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {cols} Columns
                  </div>
                  <div className="absolute top-0 -left-6 text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity [writing-mode:vertical-lr] rotate-180">
                    {rows} Rows
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-700">
                  <Lucide.Ghost className="w-16 h-16 stroke-1" />
                  <p className="text-sm font-medium">Empty Workspace. Start Generating.</p>
                </div>
              )}

              {error && (
                <div className="absolute bottom-6 left-6 right-6 bg-red-900/80 border border-red-500/50 backdrop-blur text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                  <Lucide.AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* History / Reel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Generation History</h2>
             <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {history.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSpriteSheet(img)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all focus:ring-2 focus:ring-indigo-500 outline-none ${spriteSheet === img ? 'border-indigo-500 scale-95 shadow-lg shadow-indigo-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
                {history.length === 0 && (
                  <div className="flex-1 py-10 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-700 text-xs italic">
                    No history yet
                  </div>
                )}
             </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 p-6 text-center text-slate-600 text-[10px] font-mono tracking-widest uppercase">
        SpriteStudio AI &copy; {new Date().getFullYear()} • Experimental Generative Canvas
      </footer>
    </div>
  );
};

export default App;
