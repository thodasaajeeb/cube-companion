export type CubeColor4x4 = 'W' | 'Y' | 'R' | 'O' | 'B' | 'G';

export type FaceName4x4 = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

// 4x4 face has 16 stickers
export type Face4x4 = CubeColor4x4[];

export type CubeState4x4 = {
  U: Face4x4;
  D: Face4x4;
  F: Face4x4;
  B: Face4x4;
  L: Face4x4;
  R: Face4x4;
};

// 4x4 has additional inner layer moves
export type Move4x4 = 
  | 'F' | "F'" | 'F2'
  | 'R' | "R'" | 'R2'
  | 'U' | "U'" | 'U2'
  | 'B' | "B'" | 'B2'
  | 'L' | "L'" | 'L2'
  | 'D' | "D'" | 'D2'
  | 'f' | "f'" | 'f2'  // inner F layer
  | 'r' | "r'" | 'r2'  // inner R layer
  | 'u' | "u'" | 'u2'  // inner U layer
  | 'b' | "b'" | 'b2'
  | 'l' | "l'" | 'l2'
  | 'd' | "d'" | 'd2';

export const COLORS_4X4: Record<CubeColor4x4, string> = {
  W: 'bg-cube-white',
  Y: 'bg-cube-yellow',
  R: 'bg-cube-red',
  O: 'bg-cube-orange',
  B: 'bg-cube-blue',
  G: 'bg-cube-green',
};

const createFace = (color: CubeColor4x4): Face4x4 => 
  Array(16).fill(color) as Face4x4;

export const SOLVED_CUBE_4X4: CubeState4x4 = {
  U: createFace('W'),
  D: createFace('Y'),
  F: createFace('R'),
  B: createFace('O'),
  L: createFace('G'),
  R: createFace('B'),
};
