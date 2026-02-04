export type CubeColor2x2 = 'W' | 'Y' | 'R' | 'O' | 'B' | 'G';

export type FaceName2x2 = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

export type Face2x2 = [CubeColor2x2, CubeColor2x2, CubeColor2x2, CubeColor2x2];

export type CubeState2x2 = {
  U: Face2x2;
  D: Face2x2;
  F: Face2x2;
  B: Face2x2;
  L: Face2x2;
  R: Face2x2;
};

export type Move2x2 = 
  | 'F' | "F'" | 'F2'
  | 'R' | "R'" | 'R2'
  | 'U' | "U'" | 'U2';

export const COLORS_2X2: Record<CubeColor2x2, string> = {
  W: 'bg-cube-white',
  Y: 'bg-cube-yellow',
  R: 'bg-cube-red',
  O: 'bg-cube-orange',
  B: 'bg-cube-blue',
  G: 'bg-cube-green',
};

export const SOLVED_CUBE_2X2: CubeState2x2 = {
  U: ['W', 'W', 'W', 'W'],
  D: ['Y', 'Y', 'Y', 'Y'],
  F: ['R', 'R', 'R', 'R'],
  B: ['O', 'O', 'O', 'O'],
  L: ['G', 'G', 'G', 'G'],
  R: ['B', 'B', 'B', 'B'],
};
