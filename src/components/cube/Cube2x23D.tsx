import { CubeState2x2, COLORS_2X2 } from '@/types/cube2x2';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Cube2x23DProps {
  cube: CubeState2x2;
  rotationX?: number;
  rotationY?: number;
}

export const Cube2x23D = ({ cube, rotationX = -25, rotationY = -35 }: Cube2x23DProps) => {
  const cellSize = 56;
  const gap = 4;
  const faceSize = cellSize * 2 + gap;
  const halfFace = faceSize / 2;

  const renderFace = (face: keyof CubeState2x2, transform: string) => (
    <div
      className="absolute grid grid-cols-2 gap-1 p-1 bg-black/90 rounded-md"
      style={{
        width: faceSize,
        height: faceSize,
        transform,
        backfaceVisibility: 'hidden',
      }}
    >
      {cube[face].map((color, index) => (
        <div
          key={index}
          className={cn(
            'rounded-sm transition-colors duration-200',
            COLORS_2X2[color]
          )}
          style={{
            width: cellSize,
            height: cellSize,
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)',
          }}
        />
      ))}
    </div>
  );

  return (
    <div 
      className="cube-3d-container flex items-center justify-center"
      style={{ width: 240, height: 240 }}
    >
      <motion.div
        className="cube-3d relative"
        style={{
          width: faceSize,
          height: faceSize,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: rotationX,
          rotateY: rotationY,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {renderFace('F', `translateZ(${halfFace}px)`)}
        {renderFace('B', `translateZ(-${halfFace}px) rotateY(180deg)`)}
        {renderFace('R', `translateX(${halfFace}px) rotateY(90deg)`)}
        {renderFace('L', `translateX(-${halfFace}px) rotateY(-90deg)`)}
        {renderFace('U', `translateY(-${halfFace}px) rotateX(90deg)`)}
        {renderFace('D', `translateY(${halfFace}px) rotateX(-90deg)`)}
      </motion.div>
    </div>
  );
};
