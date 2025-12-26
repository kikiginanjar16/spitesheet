
import React, { useState, useEffect, useRef } from 'react';

interface PreviewAnimatorProps {
  imageSrc: string | null;
  rows: number;
  cols: number;
}

const PreviewAnimator: React.FC<PreviewAnimatorProps> = ({ imageSrc, rows, cols }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const totalFrames = rows * cols;

  useEffect(() => {
    if (!isPlaying || !imageSrc) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, 100); // 10 FPS

    return () => clearInterval(interval);
  }, [isPlaying, totalFrames, imageSrc]);

  if (!imageSrc) return null;

  const col = currentFrame % cols;
  const row = Math.floor(currentFrame / cols);

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Animation Preview</h3>
      <div 
        className="relative overflow-hidden border-4 border-slate-900 bg-slate-900 rounded-lg shadow-2xl"
        style={{
          width: '128px',
          height: '128px',
        }}
      >
        <div
          style={{
            width: `${cols * 100}%`,
            height: `${rows * 100}%`,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: `${cols * 100}% ${rows * 100}%`,
            backgroundPosition: `${(col / (cols - 1 || 1)) * 100}% ${(row / (rows - 1 || 1)) * 100}%`,
            imageRendering: 'pixelated',
          }}
          className="w-full h-full transition-none"
        />
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md text-xs font-medium transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <span className="text-[10px] font-mono text-slate-500 flex items-center">
          Frame {currentFrame + 1}/{totalFrames}
        </span>
      </div>
    </div>
  );
};

export default PreviewAnimator;
