import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, RotateCcw, Sparkles, Loader2, AlertCircle, Camera, Construction } from 'lucide-react';
import { useCube4x4 } from '@/hooks/useCube4x4';
import { Cube4x43D } from '@/components/cube/Cube4x43D';
import { Cube4x4Net } from '@/components/cube/Cube4x4Net';
import { ColorPicker } from '@/components/cube/ColorPicker';
import { CameraScanner } from '@/components/cube/CameraScanner';
import { CubeColor } from '@/types/cube';
import { CubeState4x4, Move4x4 } from '@/types/cube4x4';

type ViewMode = '3d' | 'net';

export const Cube4x4Solver = () => {
  const {
    cube,
    solution,
    currentStep,
    isPlaying,
    isSolving,
    error,
    isCubeSolved,
    reset,
    scramble,
    executeMove,
    setFaceColor,
    setCubeState,
    solve,
    stepForward,
    stepBackward,
    jumpToStep,
    setIsPlaying,
  } = useCube4x4();

  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [selectedColor, setSelectedColor] = useState<CubeColor | null>(null);
  const [rotation, setRotation] = useState({ x: -25, y: -35 });
  const [showScanner, setShowScanner] = useState(false);

  const handleScanComplete = (scannedCube: Record<string, CubeColor[]>) => {
    setCubeState(scannedCube as unknown as CubeState4x4);
    setShowScanner(false);
  };

  const MOVES: Move4x4[] = ['F', "F'", 'R', "R'", 'U', "U'", 'B', "B'", 'L', "L'", 'D', "D'"];

  return (
    <>
      {showScanner && (
        <CameraScanner
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
          cubeSize={4}
        />
      )}

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === '3d' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              3D View
            </button>
            <button
              onClick={() => setViewMode('net')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'net' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Flat View
            </button>
            <button
              onClick={() => setShowScanner(true)}
              className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Scan
            </button>
          </div>

          <motion.div className="glass-panel p-8 flex items-center justify-center min-h-[320px]" layout>
            {viewMode === '3d' ? (
              <Cube4x43D cube={cube} rotationX={rotation.x} rotationY={rotation.y} />
            ) : (
              <Cube4x4Net
                cube={cube}
                onCellClick={selectedColor ? (face, index) => setFaceColor(face, index, selectedColor as any) : undefined}
                selectedColor={selectedColor}
              />
            )}
          </motion.div>

          {viewMode === '3d' && (
            <div className="flex gap-4 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Rotate:</span>
                <button onClick={() => setRotation(r => ({ ...r, y: r.y - 45 }))} className="move-btn px-3 py-1">←</button>
                <button onClick={() => setRotation(r => ({ ...r, y: r.y + 45 }))} className="move-btn px-3 py-1">→</button>
                <button onClick={() => setRotation(r => ({ ...r, x: r.x - 30 }))} className="move-btn px-3 py-1">↑</button>
                <button onClick={() => setRotation(r => ({ ...r, x: r.x + 30 }))} className="move-btn px-3 py-1">↓</button>
              </div>
            </div>
          )}

          {isCubeSolved && !solution && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 px-6 rounded-xl bg-success/10 border border-success/20"
            >
              <span className="text-success font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Cube is solved!
              </span>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          {viewMode === 'net' && (
            <div className="glass-panel p-6">
              <ColorPicker selectedColor={selectedColor} onColorSelect={setSelectedColor} />
            </div>
          )}

          <div className="glass-panel p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Manual moves</h3>
            <div className="flex flex-wrap gap-2">
              {MOVES.map(move => (
                <button key={move} onClick={() => executeMove(move)} disabled={isSolving || isPlaying} className="move-btn">
                  {move}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <div className="flex gap-3">
              <button onClick={scramble} disabled={isSolving || isPlaying} className="action-btn-secondary flex-1 flex items-center justify-center gap-2">
                <Shuffle className="w-4 h-4" /> Scramble
              </button>
              <button onClick={reset} disabled={isSolving || isPlaying} className="action-btn-secondary flex-1 flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
            
            <button onClick={solve} disabled={isSolving || isCubeSolved || isPlaying} className="action-btn-primary w-full flex items-center justify-center gap-2 text-lg py-4">
              {isSolving ? (<><Loader2 className="w-5 h-5 animate-spin" /> Solving...</>) : (<><Sparkles className="w-5 h-5" /> Solve</>)}
            </button>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm"
            >
              <Construction className="w-4 h-4 mt-0.5 flex-shrink-0" />
              4×4 solver is in development. The reduction method solver will be added soon.
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
