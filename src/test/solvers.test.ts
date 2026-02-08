import { describe, it, expect } from 'vitest';
import { cloneCube2x2, applyMoves2x2, generateScramble2x2, isSolved2x2, solve2x2 } from '@/lib/cube2x2Utils';
import { SOLVED_CUBE_2X2 } from '@/types/cube2x2';
import { solveCube } from '@/lib/cubeSolver';
import { applyMoves, generateScramble, isSolved, cloneCube } from '@/lib/cubeUtils';
import { SOLVED_CUBE } from '@/types/cube';
import { cloneCube4x4, applyMoves4x4, generateScramble4x4, isSolved4x4 } from '@/lib/cube4x4Utils';
import { solve4x4Reduction } from '@/lib/cube4x4Solver';
import { SOLVED_CUBE_4X4 } from '@/types/cube4x4';

describe('2x2 Solver', () => {
  it('solves a short scramble', () => {
    const scramble = generateScramble2x2(4);
    const scrambled = applyMoves2x2(cloneCube2x2(SOLVED_CUBE_2X2), scramble);
    expect(isSolved2x2(scrambled)).toBe(false);
    
    const solution = solve2x2(scrambled);
    expect(solution).not.toBeNull();
    
    const solved = applyMoves2x2(scrambled, solution!);
    expect(isSolved2x2(solved)).toBe(true);
  });

  it('returns empty array for solved cube', () => {
    const solution = solve2x2(cloneCube2x2(SOLVED_CUBE_2X2));
    expect(solution).toEqual([]);
  });
});

describe('3x3 Solver', () => {
  it('solves a short scramble', async () => {
    const scramble = generateScramble(3);
    const scrambled = applyMoves(cloneCube(SOLVED_CUBE), scramble);
    expect(isSolved(scrambled)).toBe(false);

    const result = await solveCube(scrambled);
    expect(result.success).toBe(true);
    expect(result.solution).toBeDefined();

    const solved = applyMoves(scrambled, result.solution!);
    expect(isSolved(solved)).toBe(true);
  }, 30000);

  it('returns empty for solved cube', async () => {
    const result = await solveCube(cloneCube(SOLVED_CUBE));
    expect(result.success).toBe(true);
    expect(result.solution).toEqual([]);
  });
});

describe('4x4 Solver', () => {
  it('returns success for solved cube', async () => {
    const result = await solve4x4Reduction(cloneCube4x4(SOLVED_CUBE_4X4));
    expect(result.success).toBe(true);
    expect(result.solution).toEqual([]);
  });

  it('solves a short scramble', async () => {
    const scrambled = applyMoves4x4(cloneCube4x4(SOLVED_CUBE_4X4), generateScramble4x4(5));
    const result = await solve4x4Reduction(scrambled);
    expect(result.success).toBe(true);
    expect(result.solution).toBeDefined();

    const solved = applyMoves4x4(scrambled, result.solution!);
    expect(isSolved4x4(solved)).toBe(true);
  }, 30000);
});
