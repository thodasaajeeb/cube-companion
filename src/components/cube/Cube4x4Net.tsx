import { CubeState4x4, COLORS_4X4 } from '@/types/cube4x4';
import { cn } from '@/lib/utils';

interface Cube4x4NetProps {
  cube: CubeState4x4;
  onCellClick?: (face: keyof CubeState4x4, index: number) => void;
  selectedColor?: string | null;
}

const Face4x4 = ({ 
  face, 
  faceName, 
  faceKey,
  onCellClick,
}: { 
  face: CubeState4x4[keyof CubeState4x4]; 
  faceName: string;
  faceKey: keyof CubeState4x4;
  onCellClick?: (face: keyof CubeState4x4, index: number) => void;
}) => (
  <div className="flex flex-col items-center">
    <span className="text-xs text-muted-foreground mb-1">{faceName}</span>
    <div className="grid grid-cols-4 gap-0.5">
      {face.map((color, index) => (
        <button
          key={index}
          onClick={() => onCellClick?.(faceKey, index)}
          disabled={!onCellClick}
          className={cn(
            'w-5 h-5 rounded-sm border border-black/20',
            COLORS_4X4[color],
            onCellClick && 'hover:ring-2 hover:ring-primary cursor-pointer'
          )}
        />
      ))}
    </div>
  </div>
);

export const Cube4x4Net = ({ cube, onCellClick }: Cube4x4NetProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* U face */}
      <div className="flex justify-center">
        <Face4x4 face={cube.U} faceName="U" faceKey="U" onCellClick={onCellClick} />
      </div>
      
      {/* L F R B row */}
      <div className="flex gap-1">
        <Face4x4 face={cube.L} faceName="L" faceKey="L" onCellClick={onCellClick} />
        <Face4x4 face={cube.F} faceName="F" faceKey="F" onCellClick={onCellClick} />
        <Face4x4 face={cube.R} faceName="R" faceKey="R" onCellClick={onCellClick} />
        <Face4x4 face={cube.B} faceName="B" faceKey="B" onCellClick={onCellClick} />
      </div>
      
      {/* D face */}
      <div className="flex justify-center">
        <Face4x4 face={cube.D} faceName="D" faceKey="D" onCellClick={onCellClick} />
      </div>
    </div>
  );
};
