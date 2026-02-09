import { CubeState4x4, Move4x4, CubeColor4x4, SOLVED_CUBE_4X4 } from '@/types/cube4x4';
import { CubeState, Move, SOLVED_CUBE } from '@/types/cube';
import { applyMove4x4, applyMoves4x4, cloneCube4x4, isSolved4x4 } from './cube4x4Utils';
import { applyMove, isSolved } from './cubeUtils';
import { solveCube } from './cubeSolver';

// ── Helpers ──────────────────────────────────────────────

const CENTER = [5, 6, 9, 10];
const FACES: (keyof CubeState4x4)[] = ['U', 'D', 'F', 'B', 'L', 'R'];
const FACE_COLOR: Record<string, CubeColor4x4> = {
  U: 'W', D: 'Y', F: 'R', B: 'O', L: 'G', R: 'B',
};

function correctCenters(cube: CubeState4x4): number {
  let n = 0;
  for (const f of FACES) for (const p of CENTER) if (cube[f][p] === FACE_COLOR[f]) n++;
  return n;
}

function centersOk(cube: CubeState4x4): boolean {
  return correctCenters(cube) === 24;
}

function countPairedEdges(cube: CubeState4x4): number {
  const checks = [
    cube.U[13] === cube.U[14] && cube.F[1] === cube.F[2],     // UF
    cube.U[1] === cube.U[2] && cube.B[1] === cube.B[2],       // UB
    cube.U[4] === cube.U[8] && cube.L[1] === cube.L[2],       // UL
    cube.U[7] === cube.U[11] && cube.R[1] === cube.R[2],      // UR
    cube.D[1] === cube.D[2] && cube.F[13] === cube.F[14],     // DF
    cube.D[13] === cube.D[14] && cube.B[13] === cube.B[14],   // DB
    cube.D[4] === cube.D[8] && cube.L[13] === cube.L[14],     // DL
    cube.D[7] === cube.D[11] && cube.R[13] === cube.R[14],    // DR
    cube.F[4] === cube.F[8] && cube.L[7] === cube.L[11],      // FL
    cube.F[7] === cube.F[11] && cube.R[4] === cube.R[8],      // FR
    cube.B[7] === cube.B[11] && cube.L[4] === cube.L[8],      // BL
    cube.B[4] === cube.B[8] && cube.R[7] === cube.R[11],      // BR
  ];
  return checks.filter(Boolean).length;
}

function edgesPaired(cube: CubeState4x4): boolean {
  return countPairedEdges(cube) === 12;
}

function invertMove4x4(move: Move4x4): Move4x4 {
  if (move.includes('2')) return move;
  if (move.includes("'")) return move.replace("'", '') as Move4x4;
  return (move + "'") as Move4x4;
}

// ── Phase 1: Solve Centers (greedy depth search) ──────────

const ALL_CENTER_MOVES: Move4x4[] = [
  'u', "u'", 'd', "d'", 'r', "r'", 'l', "l'", 'f', "f'", 'b', "b'",
  'U', "U'", 'D', "D'", 'F', "F'", 'R', "R'", 'B', "B'", 'L', "L'",
];

function solveCenters(cube: CubeState4x4, timeout: number): { cube: CubeState4x4; moves: Move4x4[] } | null {
  const start = Date.now();
  let current = cloneCube4x4(cube);
  const allMoves: Move4x4[] = [];

  for (let iter = 0; iter < 300; iter++) {
    if (centersOk(current)) return { cube: current, moves: allMoves };
    if (Date.now() - start > timeout) return null;

    const score = correctCenters(current);
    let bestSeq: Move4x4[] = [];
    let bestScore = score;
    let bestCube: CubeState4x4 = current;

    // Depth 1
    for (const m of ALL_CENTER_MOVES) {
      const nc = applyMove4x4(current, m);
      const s = correctCenters(nc);
      if (s > bestScore) { bestScore = s; bestSeq = [m]; bestCube = nc; }
    }

    if (bestScore > score) {
      allMoves.push(...bestSeq);
      current = bestCube;
      continue;
    }

    // Depth 2
    for (const m1 of ALL_CENTER_MOVES) {
      const c1 = applyMove4x4(current, m1);
      for (const m2 of ALL_CENTER_MOVES) {
        if (m1[0] === m2[0]) continue;
        const c2 = applyMove4x4(c1, m2);
        const s = correctCenters(c2);
        if (s > bestScore) { bestScore = s; bestSeq = [m1, m2]; bestCube = c2; }
      }
      if (bestScore > score) break;
    }

    if (bestScore > score) {
      allMoves.push(...bestSeq);
      current = bestCube;
      continue;
    }

    // Depth 3
    outer3: for (const m1 of ALL_CENTER_MOVES) {
      const c1 = applyMove4x4(current, m1);
      for (const m2 of ALL_CENTER_MOVES) {
        if (m1[0] === m2[0]) continue;
        const c2 = applyMove4x4(c1, m2);
        for (const m3 of ALL_CENTER_MOVES) {
          if (m2[0] === m3[0]) continue;
          const c3 = applyMove4x4(c2, m3);
          const s = correctCenters(c3);
          if (s > bestScore) {
            bestScore = s; bestSeq = [m1, m2, m3]; bestCube = c3;
            break outer3;
          }
        }
      }
    }

    if (bestScore > score) {
      allMoves.push(...bestSeq);
      current = bestCube;
      continue;
    }

    // Plateau escape: apply a random 2-move sequence
    const r1 = ALL_CENTER_MOVES[Math.floor(Math.random() * ALL_CENTER_MOVES.length)];
    let r2: Move4x4;
    do { r2 = ALL_CENTER_MOVES[Math.floor(Math.random() * ALL_CENTER_MOVES.length)]; } while (r1[0] === r2[0]);
    allMoves.push(r1, r2);
    current = applyMove4x4(applyMove4x4(current, r1), r2);
  }

  return centersOk(current) ? { cube: current, moves: allMoves } : null;
}

// ── Phase 2: Pair Edges (greedy with compensated sequences) ──

const EDGE_PAIR_MOVES: Move4x4[] = [
  'U', "U'", 'U2', 'D', "D'", 'D2',
  'F', "F'", 'F2', 'R', "R'", 'R2',
  'B', "B'", 'B2', 'L', "L'", 'L2',
  'u', "u'", 'd', "d'",
];

function pairEdges(cube: CubeState4x4, timeout: number): { cube: CubeState4x4; moves: Move4x4[] } | null {
  const start = Date.now();
  let current = cloneCube4x4(cube);
  const allMoves: Move4x4[] = [];

  for (let iter = 0; iter < 200; iter++) {
    if (edgesPaired(current) && centersOk(current)) return { cube: current, moves: allMoves };
    if (Date.now() - start > timeout) return null;

    const score = countPairedEdges(current);
    const cScore = correctCenters(current);
    let bestSeq: Move4x4[] = [];
    let bestEdgeScore = score;
    let bestCenterScore = cScore;
    let bestCube: CubeState4x4 = current;

    // We need sequences that end with centers correct AND improve edge pairing.
    // Try compensated sequences: [setup] [slice] [adjust] [unslice]

    // Depth 1-2: only outer moves (preserve centers)
    for (const m of EDGE_PAIR_MOVES) {
      const nc = applyMove4x4(current, m);
      const es = countPairedEdges(nc);
      const cs = correctCenters(nc);
      if (cs >= bestCenterScore && es > bestEdgeScore) {
        bestEdgeScore = es; bestCenterScore = cs; bestSeq = [m]; bestCube = nc;
      }
    }

    if (bestEdgeScore > score) {
      allMoves.push(...bestSeq);
      current = bestCube;
      continue;
    }

    // Depth 3-4: try short compensated sequences
    for (const m1 of EDGE_PAIR_MOVES) {
      const c1 = applyMove4x4(current, m1);
      for (const m2 of EDGE_PAIR_MOVES) {
        if (m1[0] === m2[0]) continue;
        const c2 = applyMove4x4(c1, m2);
        for (const m3 of EDGE_PAIR_MOVES) {
          if (m2[0] === m3[0]) continue;
          const c3 = applyMove4x4(c2, m3);
          const es = countPairedEdges(c3);
          const cs = correctCenters(c3);
          if (cs >= cScore && es > bestEdgeScore) {
            bestEdgeScore = es; bestCenterScore = cs;
            bestSeq = [m1, m2, m3]; bestCube = c3;
          }
        }
      }
      if (bestEdgeScore > score) break;
      if (Date.now() - start > timeout) return null;
    }

    if (bestEdgeScore > score) {
      allMoves.push(...bestSeq);
      current = bestCube;
      continue;
    }

    // Try known edge-pairing algorithms as macro moves
    const macros: Move4x4[][] = [
      ["u'", 'F', "u"],
      ["u'", "F'", "u"],
      ["u", 'F', "u'"],
      ["u", "F'", "u'"],
      ["d", 'F', "d'"],
      ["d", "F'", "d'"],
      ["d'", 'F', "d"],
      ["u'", 'R', "U'", "R'", 'u'],
      ["u", "L'", 'U', 'L', "u'"],
      ["d", "R'", 'D', 'R', "d'"],
      ["d'", 'L', "D'", "L'", 'd'],
      ["u'", "R'", 'F', 'R', 'u'],
      ["u", 'L', "F'", "L'", "u'"],
    ];

    for (const macro of macros) {
      // Try with various setup moves
      const setups: Move4x4[][] = [[], ['U'], ["U'"], ['U2'], ['F'], ["F'"], ['R'], ["R'"], ['D'], ["D'"]];
      for (const setup of setups) {
        const teardown = setup.map(invertMove4x4).reverse() as Move4x4[];
        const fullSeq = [...setup, ...macro, ...teardown];
        const nc = applyMoves4x4(current, fullSeq);
        const es = countPairedEdges(nc);
        const cs = correctCenters(nc);
        if (cs >= cScore && es > bestEdgeScore) {
          bestEdgeScore = es; bestCenterScore = cs;
          bestSeq = fullSeq; bestCube = nc;
        }
      }
    }

    if (bestEdgeScore > score) {
      allMoves.push(...bestSeq);
      current = bestCube;
      continue;
    }

    // Random outer move to escape plateau
    const outerMoves: Move4x4[] = ['U', "U'", 'D', "D'", 'F', "F'", 'R', "R'", 'B', "B'", 'L', "L'"];
    const rm = outerMoves[Math.floor(Math.random() * outerMoves.length)];
    allMoves.push(rm);
    current = applyMove4x4(current, rm);
  }

  return (edgesPaired(current) && centersOk(current)) ? { cube: current, moves: allMoves } : null;
}

// ── Phase 3: Solve as 3x3 ──────────────────────────────────

function mapTo3x3(cube: CubeState4x4): CubeState {
  // 4x4 pos → 3x3 pos mapping: 0→0, 1→1, 3→2, 4→3, 5→4, 7→5, 12→6, 13→7, 15→8
  const map4to3 = [0, 1, -1, 2, 3, 4, -1, 5, -1, -1, -1, -1, 6, 7, -1, 8];
  const pickIdx = [0, 1, 3, 4, 5, 7, 12, 13, 15];

  const result: CubeState = {
    U: Array(9).fill('W') as any,
    D: Array(9).fill('Y') as any,
    F: Array(9).fill('R') as any,
    B: Array(9).fill('O') as any,
    L: Array(9).fill('G') as any,
    R: Array(9).fill('B') as any,
  };

  for (const face of FACES) {
    for (let i = 0; i < 9; i++) {
      result[face][i] = cube[face][pickIdx[i]] as any;
    }
  }

  return result;
}

async function solveAs3x3(cube: CubeState4x4): Promise<{ cube: CubeState4x4; moves: Move4x4[] } | null> {
  const cube3x3 = mapTo3x3(cube);

  const allSame = FACES.every(f => cube3x3[f].every((c: any) => c === cube3x3[f][0]));
  if (allSame) return { cube, moves: [] };

  try {
    const result = await solveCube(cube3x3);
    if (!result.success || !result.solution) return null;

    const moves4x4: Move4x4[] = result.solution.map(m => m as Move4x4);
    const current = applyMoves4x4(cloneCube4x4(cube), moves4x4);
    return { cube: current, moves: moves4x4 };
  } catch {
    return null;
  }
}

// ── Main Solver ─────────────────────────────────────────────

export async function solve4x4Reduction(cube: CubeState4x4): Promise<{
  success: boolean;
  solution?: Move4x4[];
  error?: string;
}> {
  if (isSolved4x4(cube)) return { success: true, solution: [] };

  try {
    const centerResult = solveCenters(cube, 4000);
    if (!centerResult) {
      return { success: false, error: 'Could not solve centers. Try a shorter scramble or check cube configuration.' };
    }

    const edgeResult = pairEdges(centerResult.cube, 4000);
    if (!edgeResult) {
      return { success: false, error: 'Could not pair edges. Try a shorter scramble.' };
    }

    const finalResult = await solveAs3x3(edgeResult.cube);
    if (!finalResult) {
      return { success: false, error: 'Could not complete 3x3 phase. Try a shorter scramble.' };
    }

    if (!isSolved4x4(finalResult.cube)) {
      return { success: false, error: 'Solver did not fully solve the cube. Try a shorter scramble.' };
    }

    const solution = [...centerResult.moves, ...edgeResult.moves, ...finalResult.moves];
    return { success: true, solution };
  } catch (e) {
    return { success: false, error: 'Solver encountered an error. Try resetting and using a shorter scramble.' };
  }
}
