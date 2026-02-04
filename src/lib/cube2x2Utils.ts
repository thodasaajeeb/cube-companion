import { CubeState2x2, Face2x2, Move2x2, SOLVED_CUBE_2X2 } from '@/types/cube2x2';

export const cloneCube2x2 = (cube: CubeState2x2): CubeState2x2 => ({
  U: [...cube.U] as Face2x2,
  D: [...cube.D] as Face2x2,
  F: [...cube.F] as Face2x2,
  B: [...cube.B] as Face2x2,
  L: [...cube.L] as Face2x2,
  R: [...cube.R] as Face2x2,
});

// Rotate a 2x2 face clockwise
const rotateFaceCW = (face: Face2x2): Face2x2 => [
  face[2], face[0],
  face[3], face[1],
];

// Rotate a 2x2 face counter-clockwise
const rotateFaceCCW = (face: Face2x2): Face2x2 => [
  face[1], face[3],
  face[0], face[2],
];

export const applyMove2x2 = (cube: CubeState2x2, move: Move2x2): CubeState2x2 => {
  const newCube = cloneCube2x2(cube);
  
  switch (move) {
    case 'F': {
      newCube.F = rotateFaceCW(cube.F);
      const tempU = [cube.U[2], cube.U[3]];
      const tempR = [cube.R[0], cube.R[2]];
      const tempD = [cube.D[0], cube.D[1]];
      const tempL = [cube.L[1], cube.L[3]];
      
      newCube.R[0] = tempU[0];
      newCube.R[2] = tempU[1];
      newCube.D[0] = tempR[1];
      newCube.D[1] = tempR[0];
      newCube.L[1] = tempD[0];
      newCube.L[3] = tempD[1];
      newCube.U[2] = tempL[1];
      newCube.U[3] = tempL[0];
      break;
    }
    case "F'": {
      newCube.F = rotateFaceCCW(cube.F);
      const tempU = [cube.U[2], cube.U[3]];
      const tempR = [cube.R[0], cube.R[2]];
      const tempD = [cube.D[0], cube.D[1]];
      const tempL = [cube.L[1], cube.L[3]];
      
      newCube.L[1] = tempU[1];
      newCube.L[3] = tempU[0];
      newCube.U[2] = tempR[0];
      newCube.U[3] = tempR[1];
      newCube.R[0] = tempD[1];
      newCube.R[2] = tempD[0];
      newCube.D[0] = tempL[0];
      newCube.D[1] = tempL[1];
      break;
    }
    case 'F2':
      return applyMove2x2(applyMove2x2(cube, 'F'), 'F');
    
    case 'R': {
      newCube.R = rotateFaceCW(cube.R);
      const tempU = [cube.U[1], cube.U[3]];
      const tempF = [cube.F[1], cube.F[3]];
      const tempD = [cube.D[1], cube.D[3]];
      const tempB = [cube.B[0], cube.B[2]];
      
      newCube.U[1] = tempF[0];
      newCube.U[3] = tempF[1];
      newCube.B[0] = tempU[1];
      newCube.B[2] = tempU[0];
      newCube.D[1] = tempB[1];
      newCube.D[3] = tempB[0];
      newCube.F[1] = tempD[0];
      newCube.F[3] = tempD[1];
      break;
    }
    case "R'": {
      newCube.R = rotateFaceCCW(cube.R);
      const tempU = [cube.U[1], cube.U[3]];
      const tempF = [cube.F[1], cube.F[3]];
      const tempD = [cube.D[1], cube.D[3]];
      const tempB = [cube.B[0], cube.B[2]];
      
      newCube.F[1] = tempU[0];
      newCube.F[3] = tempU[1];
      newCube.U[1] = tempB[1];
      newCube.U[3] = tempB[0];
      newCube.B[0] = tempD[1];
      newCube.B[2] = tempD[0];
      newCube.D[1] = tempF[0];
      newCube.D[3] = tempF[1];
      break;
    }
    case 'R2':
      return applyMove2x2(applyMove2x2(cube, 'R'), 'R');
    
    case 'U': {
      newCube.U = rotateFaceCW(cube.U);
      const tempF = [cube.F[0], cube.F[1]];
      const tempR = [cube.R[0], cube.R[1]];
      const tempB = [cube.B[0], cube.B[1]];
      const tempL = [cube.L[0], cube.L[1]];
      
      newCube.F[0] = tempR[0];
      newCube.F[1] = tempR[1];
      newCube.R[0] = tempB[0];
      newCube.R[1] = tempB[1];
      newCube.B[0] = tempL[0];
      newCube.B[1] = tempL[1];
      newCube.L[0] = tempF[0];
      newCube.L[1] = tempF[1];
      break;
    }
    case "U'": {
      newCube.U = rotateFaceCCW(cube.U);
      const tempF = [cube.F[0], cube.F[1]];
      const tempR = [cube.R[0], cube.R[1]];
      const tempB = [cube.B[0], cube.B[1]];
      const tempL = [cube.L[0], cube.L[1]];
      
      newCube.F[0] = tempL[0];
      newCube.F[1] = tempL[1];
      newCube.L[0] = tempB[0];
      newCube.L[1] = tempB[1];
      newCube.B[0] = tempR[0];
      newCube.B[1] = tempR[1];
      newCube.R[0] = tempF[0];
      newCube.R[1] = tempF[1];
      break;
    }
    case 'U2':
      return applyMove2x2(applyMove2x2(cube, 'U'), 'U');
  }
  
  return newCube;
};

export const applyMoves2x2 = (cube: CubeState2x2, moves: Move2x2[]): CubeState2x2 => {
  return moves.reduce((state, move) => applyMove2x2(state, move), cube);
};

export const generateScramble2x2 = (length: number = 10): Move2x2[] => {
  const faces: ('F' | 'R' | 'U')[] = ['F', 'R', 'U'];
  const modifiers: ('' | "'" | '2')[] = ['', "'", '2'];
  const moves: Move2x2[] = [];
  let lastFace = '';
  
  for (let i = 0; i < length; i++) {
    let face: string;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace);
    
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push((face + modifier) as Move2x2);
    lastFace = face;
  }
  
  return moves;
};

export const isSolved2x2 = (cube: CubeState2x2): boolean => {
  return (
    cube.U.every(c => c === cube.U[0]) &&
    cube.D.every(c => c === cube.D[0]) &&
    cube.F.every(c => c === cube.F[0]) &&
    cube.B.every(c => c === cube.B[0]) &&
    cube.L.every(c => c === cube.L[0]) &&
    cube.R.every(c => c === cube.R[0])
  );
};

// Simple BFS solver for 2x2 (much more tractable than 3x3)
export const solve2x2 = (cube: CubeState2x2): Move2x2[] | null => {
  if (isSolved2x2(cube)) return [];
  
  const ALL_MOVES: Move2x2[] = ['F', "F'", 'F2', 'R', "R'", 'R2', 'U', "U'", 'U2'];
  const visited = new Set<string>();
  const queue: { cube: CubeState2x2; moves: Move2x2[] }[] = [{ cube, moves: [] }];
  
  const cubeToString = (c: CubeState2x2): string => 
    Object.values(c).flat().join('');
  
  visited.add(cubeToString(cube));
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current.moves.length > 11) continue; // 2x2 God's number is 11
    
    for (const move of ALL_MOVES) {
      // Skip redundant moves
      if (current.moves.length > 0) {
        const lastMove = current.moves[current.moves.length - 1];
        if (lastMove[0] === move[0]) continue;
      }
      
      const newCube = applyMove2x2(current.cube, move);
      const stateStr = cubeToString(newCube);
      
      if (isSolved2x2(newCube)) {
        return [...current.moves, move];
      }
      
      if (!visited.has(stateStr)) {
        visited.add(stateStr);
        queue.push({ cube: newCube, moves: [...current.moves, move] });
      }
    }
  }
  
  return null;
};
