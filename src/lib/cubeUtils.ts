import { CubeState, Face, Move, CubeColor, SOLVED_CUBE } from '@/types/cube';

// Deep clone a cube state
export const cloneCube = (cube: CubeState): CubeState => ({
  U: [...cube.U],
  D: [...cube.D],
  F: [...cube.F],
  B: [...cube.B],
  L: [...cube.L],
  R: [...cube.R],
});

// Rotate a face clockwise
const rotateFaceCW = (face: Face): Face => [
  face[6], face[3], face[0],
  face[7], face[4], face[1],
  face[8], face[5], face[2],
];

// Rotate a face counter-clockwise
const rotateFaceCCW = (face: Face): Face => [
  face[2], face[5], face[8],
  face[1], face[4], face[7],
  face[0], face[3], face[6],
];

// Apply a single move to the cube
export const applyMove = (cube: CubeState, move: Move): CubeState => {
  const newCube = cloneCube(cube);
  
  switch (move) {
    case 'F': {
      newCube.F = rotateFaceCW(cube.F);
      // U bottom row -> R left column (reversed)
      // R left column -> D top row (reversed)
      // D top row -> L right column
      // L right column -> U bottom row (reversed)
      const tempU = [cube.U[6], cube.U[7], cube.U[8]];
      const tempR = [cube.R[0], cube.R[3], cube.R[6]];
      const tempD = [cube.D[0], cube.D[1], cube.D[2]];
      const tempL = [cube.L[2], cube.L[5], cube.L[8]];
      
      newCube.R[0] = tempU[0];
      newCube.R[3] = tempU[1];
      newCube.R[6] = tempU[2];
      
      newCube.D[0] = tempR[2];
      newCube.D[1] = tempR[1];
      newCube.D[2] = tempR[0];
      
      newCube.L[2] = tempD[0];
      newCube.L[5] = tempD[1];
      newCube.L[8] = tempD[2];
      
      newCube.U[6] = tempL[2];
      newCube.U[7] = tempL[1];
      newCube.U[8] = tempL[0];
      break;
    }
    case "F'": {
      newCube.F = rotateFaceCCW(cube.F);
      const tempU = [cube.U[6], cube.U[7], cube.U[8]];
      const tempR = [cube.R[0], cube.R[3], cube.R[6]];
      const tempD = [cube.D[0], cube.D[1], cube.D[2]];
      const tempL = [cube.L[2], cube.L[5], cube.L[8]];
      
      newCube.L[2] = tempU[2];
      newCube.L[5] = tempU[1];
      newCube.L[8] = tempU[0];
      
      newCube.U[6] = tempR[0];
      newCube.U[7] = tempR[1];
      newCube.U[8] = tempR[2];
      
      newCube.R[0] = tempD[2];
      newCube.R[3] = tempD[1];
      newCube.R[6] = tempD[0];
      
      newCube.D[0] = tempL[0];
      newCube.D[1] = tempL[1];
      newCube.D[2] = tempL[2];
      break;
    }
    case 'F2':
      return applyMove(applyMove(cube, 'F'), 'F');
    
    case 'R': {
      newCube.R = rotateFaceCW(cube.R);
      const tempU = [cube.U[2], cube.U[5], cube.U[8]];
      const tempF = [cube.F[2], cube.F[5], cube.F[8]];
      const tempD = [cube.D[2], cube.D[5], cube.D[8]];
      const tempB = [cube.B[0], cube.B[3], cube.B[6]];
      
      newCube.U[2] = tempF[0];
      newCube.U[5] = tempF[1];
      newCube.U[8] = tempF[2];
      
      newCube.B[0] = tempU[2];
      newCube.B[3] = tempU[1];
      newCube.B[6] = tempU[0];
      
      newCube.D[2] = tempB[2];
      newCube.D[5] = tempB[1];
      newCube.D[8] = tempB[0];
      
      newCube.F[2] = tempD[0];
      newCube.F[5] = tempD[1];
      newCube.F[8] = tempD[2];
      break;
    }
    case "R'": {
      newCube.R = rotateFaceCCW(cube.R);
      const tempU = [cube.U[2], cube.U[5], cube.U[8]];
      const tempF = [cube.F[2], cube.F[5], cube.F[8]];
      const tempD = [cube.D[2], cube.D[5], cube.D[8]];
      const tempB = [cube.B[0], cube.B[3], cube.B[6]];
      
      newCube.F[2] = tempU[0];
      newCube.F[5] = tempU[1];
      newCube.F[8] = tempU[2];
      
      newCube.U[2] = tempB[2];
      newCube.U[5] = tempB[1];
      newCube.U[8] = tempB[0];
      
      newCube.B[0] = tempD[2];
      newCube.B[3] = tempD[1];
      newCube.B[6] = tempD[0];
      
      newCube.D[2] = tempF[0];
      newCube.D[5] = tempF[1];
      newCube.D[8] = tempF[2];
      break;
    }
    case 'R2':
      return applyMove(applyMove(cube, 'R'), 'R');
    
    case 'U': {
      newCube.U = rotateFaceCW(cube.U);
      const temp = [cube.F[0], cube.F[1], cube.F[2]];
      newCube.F[0] = cube.R[0];
      newCube.F[1] = cube.R[1];
      newCube.F[2] = cube.R[2];
      newCube.R[0] = cube.B[0];
      newCube.R[1] = cube.B[1];
      newCube.R[2] = cube.B[2];
      newCube.B[0] = cube.L[0];
      newCube.B[1] = cube.L[1];
      newCube.B[2] = cube.L[2];
      newCube.L[0] = temp[0];
      newCube.L[1] = temp[1];
      newCube.L[2] = temp[2];
      break;
    }
    case "U'": {
      newCube.U = rotateFaceCCW(cube.U);
      const temp = [cube.F[0], cube.F[1], cube.F[2]];
      newCube.F[0] = cube.L[0];
      newCube.F[1] = cube.L[1];
      newCube.F[2] = cube.L[2];
      newCube.L[0] = cube.B[0];
      newCube.L[1] = cube.B[1];
      newCube.L[2] = cube.B[2];
      newCube.B[0] = cube.R[0];
      newCube.B[1] = cube.R[1];
      newCube.B[2] = cube.R[2];
      newCube.R[0] = temp[0];
      newCube.R[1] = temp[1];
      newCube.R[2] = temp[2];
      break;
    }
    case 'U2':
      return applyMove(applyMove(cube, 'U'), 'U');
    
    case 'L': {
      newCube.L = rotateFaceCW(cube.L);
      const tempU = [cube.U[0], cube.U[3], cube.U[6]];
      const tempF = [cube.F[0], cube.F[3], cube.F[6]];
      const tempD = [cube.D[0], cube.D[3], cube.D[6]];
      const tempB = [cube.B[2], cube.B[5], cube.B[8]];
      
      newCube.F[0] = tempU[0];
      newCube.F[3] = tempU[1];
      newCube.F[6] = tempU[2];
      
      newCube.D[0] = tempF[0];
      newCube.D[3] = tempF[1];
      newCube.D[6] = tempF[2];
      
      newCube.B[2] = tempD[2];
      newCube.B[5] = tempD[1];
      newCube.B[8] = tempD[0];
      
      newCube.U[0] = tempB[2];
      newCube.U[3] = tempB[1];
      newCube.U[6] = tempB[0];
      break;
    }
    case "L'": {
      newCube.L = rotateFaceCCW(cube.L);
      const tempU = [cube.U[0], cube.U[3], cube.U[6]];
      const tempF = [cube.F[0], cube.F[3], cube.F[6]];
      const tempD = [cube.D[0], cube.D[3], cube.D[6]];
      const tempB = [cube.B[2], cube.B[5], cube.B[8]];
      
      newCube.U[0] = tempF[0];
      newCube.U[3] = tempF[1];
      newCube.U[6] = tempF[2];
      
      newCube.F[0] = tempD[0];
      newCube.F[3] = tempD[1];
      newCube.F[6] = tempD[2];
      
      newCube.D[0] = tempB[2];
      newCube.D[3] = tempB[1];
      newCube.D[6] = tempB[0];
      
      newCube.B[2] = tempU[2];
      newCube.B[5] = tempU[1];
      newCube.B[8] = tempU[0];
      break;
    }
    case 'L2':
      return applyMove(applyMove(cube, 'L'), 'L');
    
    case 'B': {
      newCube.B = rotateFaceCW(cube.B);
      const tempU = [cube.U[0], cube.U[1], cube.U[2]];
      const tempR = [cube.R[2], cube.R[5], cube.R[8]];
      const tempD = [cube.D[6], cube.D[7], cube.D[8]];
      const tempL = [cube.L[0], cube.L[3], cube.L[6]];
      
      newCube.R[2] = tempU[0];
      newCube.R[5] = tempU[1];
      newCube.R[8] = tempU[2];
      
      newCube.D[6] = tempR[0];
      newCube.D[7] = tempR[1];
      newCube.D[8] = tempR[2];
      
      newCube.L[0] = tempD[2];
      newCube.L[3] = tempD[1];
      newCube.L[6] = tempD[0];
      
      newCube.U[0] = tempL[2];
      newCube.U[1] = tempL[1];
      newCube.U[2] = tempL[0];
      break;
    }
    case "B'": {
      newCube.B = rotateFaceCCW(cube.B);
      const tempU = [cube.U[0], cube.U[1], cube.U[2]];
      const tempR = [cube.R[2], cube.R[5], cube.R[8]];
      const tempD = [cube.D[6], cube.D[7], cube.D[8]];
      const tempL = [cube.L[0], cube.L[3], cube.L[6]];
      
      newCube.L[0] = tempU[0];
      newCube.L[3] = tempU[1];
      newCube.L[6] = tempU[2];
      
      newCube.U[0] = tempR[2];
      newCube.U[1] = tempR[1];
      newCube.U[2] = tempR[0];
      
      newCube.R[2] = tempD[2];
      newCube.R[5] = tempD[1];
      newCube.R[8] = tempD[0];
      
      newCube.D[6] = tempL[0];
      newCube.D[7] = tempL[1];
      newCube.D[8] = tempL[2];
      break;
    }
    case 'B2':
      return applyMove(applyMove(cube, 'B'), 'B');
    
    case 'D': {
      newCube.D = rotateFaceCW(cube.D);
      const temp = [cube.F[6], cube.F[7], cube.F[8]];
      newCube.F[6] = cube.L[6];
      newCube.F[7] = cube.L[7];
      newCube.F[8] = cube.L[8];
      newCube.L[6] = cube.B[6];
      newCube.L[7] = cube.B[7];
      newCube.L[8] = cube.B[8];
      newCube.B[6] = cube.R[6];
      newCube.B[7] = cube.R[7];
      newCube.B[8] = cube.R[8];
      newCube.R[6] = temp[0];
      newCube.R[7] = temp[1];
      newCube.R[8] = temp[2];
      break;
    }
    case "D'": {
      newCube.D = rotateFaceCCW(cube.D);
      const temp = [cube.F[6], cube.F[7], cube.F[8]];
      newCube.F[6] = cube.R[6];
      newCube.F[7] = cube.R[7];
      newCube.F[8] = cube.R[8];
      newCube.R[6] = cube.B[6];
      newCube.R[7] = cube.B[7];
      newCube.R[8] = cube.B[8];
      newCube.B[6] = cube.L[6];
      newCube.B[7] = cube.L[7];
      newCube.B[8] = cube.L[8];
      newCube.L[6] = temp[0];
      newCube.L[7] = temp[1];
      newCube.L[8] = temp[2];
      break;
    }
    case 'D2':
      return applyMove(applyMove(cube, 'D'), 'D');
  }
  
  return newCube;
};

// Apply a sequence of moves
export const applyMoves = (cube: CubeState, moves: Move[]): CubeState => {
  return moves.reduce((state, move) => applyMove(state, move), cube);
};

// Parse a solution string into moves
export const parseMoves = (solution: string): Move[] => {
  const parts = solution.trim().split(/\s+/).filter(Boolean);
  return parts as Move[];
};

// Generate a random scramble
export const generateScramble = (length: number = 20): Move[] => {
  const faces: ('F' | 'R' | 'U' | 'B' | 'L' | 'D')[] = ['F', 'R', 'U', 'B', 'L', 'D'];
  const modifiers: ('' | "'" | '2')[] = ['', "'", '2'];
  const moves: Move[] = [];
  let lastFace = '';
  
  for (let i = 0; i < length; i++) {
    let face: string;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace);
    
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push((face + modifier) as Move);
    lastFace = face;
  }
  
  return moves;
};

// Check if cube is solved
export const isSolved = (cube: CubeState): boolean => {
  return (
    cube.U.every(c => c === cube.U[4]) &&
    cube.D.every(c => c === cube.D[4]) &&
    cube.F.every(c => c === cube.F[4]) &&
    cube.B.every(c => c === cube.B[4]) &&
    cube.L.every(c => c === cube.L[4]) &&
    cube.R.every(c => c === cube.R[4])
  );
};

// Invert a move
export const invertMove = (move: Move): Move => {
  if (move.includes('2')) return move;
  if (move.includes("'")) return move.replace("'", '') as Move;
  return (move + "'") as Move;
};

// Get the inverse of a solution
export const invertSolution = (moves: Move[]): Move[] => {
  return moves.map(invertMove).reverse();
};
