import { CubeState4x4, COLORS_4X4 } from '@/types/cube4x4';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Cube4x43DProps {
  cube: CubeState4x4;
  rotationX?: number;
  rotationY?: number;
}

export const Cube4x43D = ({ cube, rotationX = -25, rotationY = -35 }: Cube4x43DProps) => {
  const cellSize = 32;
  const gap = 3;
  const faceSize = cellSize * 4 + gap * 3;
  const halfFace = faceSize / 2;

  const renderFace = (face: keyof CubeState4x4, transform: string) => (
    <div
      className="absolute grid grid-cols-4 gap-0.5 p-1 bg-black/90 rounded-md"
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
            COLORS_4X4[color]
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
      style={{ width: 300, height: 300 }}
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
