import { CubeState4x4, Face4x4, Move4x4, SOLVED_CUBE_4X4, CubeColor4x4 } from '@/types/cube4x4';

export const cloneCube4x4 = (cube: CubeState4x4): CubeState4x4 => ({
  U: [...cube.U],
  D: [...cube.D],
  F: [...cube.F],
  B: [...cube.B],
  L: [...cube.L],
  R: [...cube.R],
});

// Rotate a 4x4 face clockwise
// Layout: 0  1  2  3
//         4  5  6  7
//         8  9  10 11
//         12 13 14 15
const rotateFaceCW = (face: Face4x4): Face4x4 => [
  face[12], face[8], face[4], face[0],
  face[13], face[9], face[5], face[1],
  face[14], face[10], face[6], face[2],
  face[15], face[11], face[7], face[3],
];

const rotateFaceCCW = (face: Face4x4): Face4x4 => [
  face[3], face[7], face[11], face[15],
  face[2], face[6], face[10], face[14],
  face[1], face[5], face[9], face[13],
  face[0], face[4], face[8], face[12],
];

// Outer layer moves for 4x4
export const applyMove4x4 = (cube: CubeState4x4, move: Move4x4): CubeState4x4 => {
  const newCube = cloneCube4x4(cube);
  const baseFace = move[0].toUpperCase();
  const isDouble = move.endsWith('2');
  const isPrime = move.includes("'");
  const isInner = move[0] === move[0].toLowerCase() && move[0] !== move[0].toUpperCase();
  
  // For simplicity, implement basic outer moves
  // Full 4x4 implementation would need inner slice moves
  
  switch (move) {
    case 'U': {
      newCube.U = rotateFaceCW(cube.U);
      const tempF = cube.F.slice(0, 4);
      const tempR = cube.R.slice(0, 4);
      const tempB = cube.B.slice(0, 4);
      const tempL = cube.L.slice(0, 4);
      
      for (let i = 0; i < 4; i++) {
        newCube.F[i] = tempR[i];
        newCube.R[i] = tempB[i];
        newCube.B[i] = tempL[i];
        newCube.L[i] = tempF[i];
      }
      break;
    }
    case "U'": {
      newCube.U = rotateFaceCCW(cube.U);
      const tempF = cube.F.slice(0, 4);
      const tempR = cube.R.slice(0, 4);
      const tempB = cube.B.slice(0, 4);
      const tempL = cube.L.slice(0, 4);
      
      for (let i = 0; i < 4; i++) {
        newCube.F[i] = tempL[i];
        newCube.L[i] = tempB[i];
        newCube.B[i] = tempR[i];
        newCube.R[i] = tempF[i];
      }
      break;
    }
    case 'U2':
      return applyMove4x4(applyMove4x4(cube, 'U'), 'U');
    
    case 'R': {
      newCube.R = rotateFaceCW(cube.R);
      const cols = [3, 7, 11, 15];
      const tempU = cols.map(i => cube.U[i]);
      const tempF = cols.map(i => cube.F[i]);
      const tempD = cols.map(i => cube.D[i]);
      const tempB = [cube.B[12], cube.B[8], cube.B[4], cube.B[0]];
      
      cols.forEach((col, i) => {
        newCube.U[col] = tempF[i];
        newCube.F[col] = tempD[i];
        newCube.D[col] = tempB[3 - i];
        newCube.B[cols[3 - i] - 3] = tempU[i];
      });
      break;
    }
    case "R'": {
      newCube.R = rotateFaceCCW(cube.R);
      const cols = [3, 7, 11, 15];
      const tempU = cols.map(i => cube.U[i]);
      const tempF = cols.map(i => cube.F[i]);
      const tempD = cols.map(i => cube.D[i]);
      const tempB = [cube.B[12], cube.B[8], cube.B[4], cube.B[0]];
      
      cols.forEach((col, i) => {
        newCube.F[col] = tempU[i];
        newCube.D[col] = tempF[i];
        newCube.B[cols[3 - i] - 3] = tempD[i];
        newCube.U[col] = tempB[3 - i];
      });
      break;
    }
    case 'R2':
      return applyMove4x4(applyMove4x4(cube, 'R'), 'R');
    
    case 'F': {
      newCube.F = rotateFaceCW(cube.F);
      const tempU = cube.U.slice(12, 16);
      const tempR = [cube.R[0], cube.R[4], cube.R[8], cube.R[12]];
      const tempD = cube.D.slice(0, 4);
      const tempL = [cube.L[3], cube.L[7], cube.L[11], cube.L[15]];
      
      for (let i = 0; i < 4; i++) {
        newCube.R[i * 4] = tempU[i];
        newCube.D[i] = tempR[3 - i];
        newCube.L[i * 4 + 3] = tempD[i];
        newCube.U[12 + i] = tempL[3 - i];
      }
      break;
    }
    case "F'": {
      newCube.F = rotateFaceCCW(cube.F);
      const tempU = cube.U.slice(12, 16);
      const tempR = [cube.R[0], cube.R[4], cube.R[8], cube.R[12]];
      const tempD = cube.D.slice(0, 4);
      const tempL = [cube.L[3], cube.L[7], cube.L[11], cube.L[15]];
      
      for (let i = 0; i < 4; i++) {
        newCube.L[i * 4 + 3] = tempU[3 - i];
        newCube.U[12 + i] = tempR[i];
        newCube.R[i * 4] = tempD[3 - i];
        newCube.D[i] = tempL[i];
      }
      break;
    }
    case 'F2':
      return applyMove4x4(applyMove4x4(cube, 'F'), 'F');
    
    // Add remaining moves as needed
    default:
      // For other moves, just return unchanged for now
      return newCube;
  }
  
  return newCube;
};

export const applyMoves4x4 = (cube: CubeState4x4, moves: Move4x4[]): CubeState4x4 => {
  return moves.reduce((state, move) => applyMove4x4(state, move), cube);
};

export const generateScramble4x4 = (length: number = 40): Move4x4[] => {
  const faces: ('F' | 'R' | 'U' | 'B' | 'L' | 'D')[] = ['F', 'R', 'U', 'B', 'L', 'D'];
  const modifiers: ('' | "'" | '2')[] = ['', "'", '2'];
  const moves: Move4x4[] = [];
  let lastFace = '';
  
  for (let i = 0; i < length; i++) {
    let face: string;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace);
    
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push((face + modifier) as Move4x4);
    lastFace = face;
  }
  
  return moves;
};

export const isSolved4x4 = (cube: CubeState4x4): boolean => {
  return (
    cube.U.every(c => c === cube.U[0]) &&
    cube.D.every(c => c === cube.D[0]) &&
    cube.F.every(c => c === cube.F[0]) &&
    cube.B.every(c => c === cube.B[0]) &&
    cube.L.every(c => c === cube.L[0]) &&
    cube.R.every(c => c === cube.R[0])
  );
};

// 4x4 solving is computationally intensive
// This is a placeholder - real implementation would use reduction method
export const solve4x4 = async (cube: CubeState4x4): Promise<{ 
  success: boolean; 
  solution?: Move4x4[]; 
  error?: string 
}> => {
  if (isSolved4x4(cube)) {
    return { success: true, solution: [] };
  }
  
  // 4x4 solving is beyond simple BFS/IDA*
  // Would require implementing the reduction method:
  // 1. Solve centers
  // 2. Pair edges
  // 3. Solve like 3x3
  return { 
    success: false, 
    error: '4x4 solver is coming soon. This requires the reduction method implementation.' 
  };
};
