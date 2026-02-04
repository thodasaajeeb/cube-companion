import { CubeState2x2, COLORS_2X2 } from '@/types/cube2x2';
import { cn } from '@/lib/utils';

interface Cube2x2NetProps {
  cube: CubeState2x2;
  onCellClick?: (face: keyof CubeState2x2, index: number) => void;
  selectedColor?: string | null;
}

const Face2x2 = ({ 
  face, 
  faceName, 
  faceKey,
  onCellClick,
}: { 
  face: CubeState2x2[keyof CubeState2x2]; 
  faceName: string;
  faceKey: keyof CubeState2x2;
  onCellClick?: (face: keyof CubeState2x2, index: number) => void;
}) => (
  <div className="flex flex-col items-center">
    <span className="text-xs text-muted-foreground mb-1">{faceName}</span>
    <div className="grid grid-cols-2 gap-0.5">
      {face.map((color, index) => (
        <button
          key={index}
          onClick={() => onCellClick?.(faceKey, index)}
          disabled={!onCellClick}
          className={cn(
            'w-8 h-8 rounded-sm border border-black/20',
            COLORS_2X2[color],
            onCellClick && 'hover:ring-2 hover:ring-primary cursor-pointer'
          )}
        />
      ))}
    </div>
  </div>
);

export const Cube2x2Net = ({ cube, onCellClick }: Cube2x2NetProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* U face */}
      <div className="flex justify-center">
        <Face2x2 face={cube.U} faceName="U" faceKey="U" onCellClick={onCellClick} />
      </div>
      
      {/* L F R B row */}
      <div className="flex gap-1">
        <Face2x2 face={cube.L} faceName="L" faceKey="L" onCellClick={onCellClick} />
        <Face2x2 face={cube.F} faceName="F" faceKey="F" onCellClick={onCellClick} />
        <Face2x2 face={cube.R} faceName="R" faceKey="R" onCellClick={onCellClick} />
        <Face2x2 face={cube.B} faceName="B" faceKey="B" onCellClick={onCellClick} />
      </div>
      
      {/* D face */}
      <div className="flex justify-center">
        <Face2x2 face={cube.D} faceName="D" faceKey="D" onCellClick={onCellClick} />
      </div>
    </div>
  );
};
