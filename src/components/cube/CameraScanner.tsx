import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { CubeColor, FaceName, CubeState } from '@/types/cube';
import { cn } from '@/lib/utils';

type CubeSize = 2 | 3 | 4;

interface CameraScannerProps {
  onScanComplete: (cube: Record<string, CubeColor[]>) => void;
  onClose: () => void;
  cubeSize?: CubeSize;
}

const FACE_ORDER: FaceName[] = ['U', 'F', 'R', 'B', 'L', 'D'];
const FACE_NAMES: Record<FaceName, string> = {
  U: 'Top (White center)',
  D: 'Bottom (Yellow center)',
  F: 'Front (Red center)',
  B: 'Back (Orange center)',
  L: 'Left (Green center)',
  R: 'Right (Blue center)',
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return [h * 360, s * 100, l * 100];
};

const detectColor = (r: number, g: number, b: number): CubeColor => {
  const [h, s, l] = rgbToHsl(r, g, b);
  
  if (s < 30 && l > 65) return 'W';
  if (h >= 40 && h <= 70 && s > 50 && l > 45) return 'Y';
  if (h >= 0 && h <= 45) {
    if (h > 15 && l > 45) return 'O';
    return 'R';
  }
  if (h > 340) return 'R';
  if (h >= 200 && h <= 260) return 'B';
  if (h >= 80 && h <= 160) return 'G';
  if (r > g && r > b) return h > 20 ? 'O' : 'R';
  if (g > r && g > b) return 'G';
  if (b > r && b > g) return 'B';
  return 'W';
};

export const CameraScanner = ({ onScanComplete, onClose, cubeSize = 3 }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);
  const [scannedFaces, setScannedFaces] = useState<Record<string, CubeColor[]>>({});
  const [currentScan, setCurrentScan] = useState<CubeColor[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const cellCount = cubeSize * cubeSize;
  const currentFace = FACE_ORDER[currentFaceIndex];

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError('Could not access camera. Please allow camera permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const scanCurrentFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const gridSize = Math.min(canvas.width, canvas.height) * 0.5;
    const cellSize = gridSize / cubeSize;
    const startX = centerX - gridSize / 2;
    const startY = centerY - gridSize / 2;

    const colors: CubeColor[] = [];
    
    for (let row = 0; row < cubeSize; row++) {
      for (let col = 0; col < cubeSize; col++) {
        const sampleX = startX + col * cellSize + cellSize / 2;
        const sampleY = startY + row * cellSize + cellSize / 2;
        
        const sampleRadius = cellSize * 0.2;
        let totalR = 0, totalG = 0, totalB = 0, count = 0;
        
        for (let dx = -sampleRadius; dx <= sampleRadius; dx += 2) {
          for (let dy = -sampleRadius; dy <= sampleRadius; dy += 2) {
            const pixel = ctx.getImageData(sampleX + dx, sampleY + dy, 1, 1).data;
            totalR += pixel[0];
            totalG += pixel[1];
            totalB += pixel[2];
            count++;
          }
        }
        
        colors.push(detectColor(totalR / count, totalG / count, totalB / count));
      }
    }

    setCurrentScan(colors);
  }, [cubeSize]);

  useEffect(() => {
    if (!stream) return;
    const interval = setInterval(() => {
      if (isScanning) scanCurrentFrame();
    }, 200);
    return () => clearInterval(interval);
  }, [stream, isScanning, scanCurrentFrame]);

  const confirmScan = () => {
    if (!currentScan) return;
    
    const newScanned = { ...scannedFaces, [currentFace]: currentScan };
    setScannedFaces(newScanned);

    if (currentFaceIndex < FACE_ORDER.length - 1) {
      setCurrentFaceIndex(prev => prev + 1);
      setCurrentScan(null);
      setIsScanning(false);
    } else {
      const defaultFace = (color: CubeColor) => Array(cellCount).fill(color) as CubeColor[];
      const completeCube: Record<string, CubeColor[]> = {
        U: newScanned.U || defaultFace('W'),
        D: newScanned.D || defaultFace('Y'),
        F: newScanned.F || defaultFace('R'),
        B: newScanned.B || defaultFace('O'),
        L: newScanned.L || defaultFace('G'),
        R: newScanned.R || defaultFace('B'),
      };
      
      stopCamera();
      onScanComplete(completeCube);
    }
  };

  const retakeScan = () => {
    setCurrentScan(null);
    setIsScanning(false);
  };

  const COLOR_DISPLAY: Record<CubeColor, string> = {
    W: 'bg-white',
    Y: 'bg-yellow-400',
    R: 'bg-red-600',
    O: 'bg-orange-500',
    B: 'bg-blue-600',
    G: 'bg-green-600',
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Scan {cubeSize}×{cubeSize} Cube - {FACE_NAMES[currentFace]}</h2>
        <button onClick={() => { stopCamera(); onClose(); }} className="p-2 hover:bg-muted rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {error ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="text-destructive">{error}</p>
            <button onClick={startCamera} className="action-btn-secondary">Try Again</button>
          </div>
        ) : (
          <>
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline className="rounded-xl max-w-full max-h-[50vh]" />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="w-1/2 aspect-square gap-1 border-2 border-primary rounded-lg grid"
                  style={{ gridTemplateColumns: `repeat(${cubeSize}, 1fr)` }}
                >
                  {Array.from({ length: cellCount }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'border border-primary/50 rounded',
                        currentScan && COLOR_DISPLAY[currentScan[i]]
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {currentScan && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">Detected colors:</p>
                <div className="gap-1 grid" style={{ gridTemplateColumns: `repeat(${cubeSize}, 1fr)` }}>
                  {currentScan.map((color, i) => (
                    <div key={i} className={cn('w-10 h-10 rounded border-2 border-border', COLOR_DISPLAY[color])} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {FACE_ORDER.map((face, i) => (
                <div
                  key={face}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                    i < currentFaceIndex ? 'bg-primary text-primary-foreground'
                      : i === currentFaceIndex ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {face}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {!isScanning && !currentScan && (
                <button onClick={() => setIsScanning(true)} className="action-btn-primary flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Start Scanning
                </button>
              )}
              {isScanning && !currentScan && (
                <button onClick={scanCurrentFrame} className="action-btn-primary flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Capture
                </button>
              )}
              {currentScan && (
                <>
                  <button onClick={retakeScan} className="action-btn-secondary flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Retake
                  </button>
                  <button onClick={confirmScan} className="action-btn-primary flex items-center gap-2">
                    <Check className="w-4 h-4" /> {currentFaceIndex < FACE_ORDER.length - 1 ? 'Next Face' : 'Finish'}
                  </button>
                </>
              )}
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-md">
              Hold your cube so the {currentFace} face fills the grid overlay, then capture.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
