import { useState, useCallback, useRef } from 'react';
import { CubeState4x4, Move4x4, CubeColor4x4, SOLVED_CUBE_4X4 } from '@/types/cube4x4';
import { applyMove4x4, applyMoves4x4, generateScramble4x4, cloneCube4x4, isSolved4x4 } from '@/lib/cube4x4Utils';

// Compute true inverse using M^3 = M^(-1) for quarter turns (order 4)
// This avoids relying on symbolic B'/B inversion which has implementation bugs
const trueInverseSequence = (scramble: Move4x4[]): Move4x4[] => {
  const result: Move4x4[] = [];
  for (let i = scramble.length - 1; i >= 0; i--) {
    const move = scramble[i];
    if (move.includes('2')) {
      result.push(move); // half turns are self-inverse (M^2 composed with M^2 = M^4 = identity)
    } else {
      result.push(move, move, move); // M^3 = M^(-1) for quarter turns
    }
  }
  return result;
};

export const useCube4x4 = () => {
  const [cube, setCube] = useState<CubeState4x4>(cloneCube4x4(SOLVED_CUBE_4X4));
  const [solution, setSolution] = useState<Move4x4[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrambleMoves = useRef<Move4x4[] | null>(null);

  const reset = useCallback(() => {
    setCube(cloneCube4x4(SOLVED_CUBE_4X4));
    setSolution(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setError(null);
    scrambleMoves.current = null;
  }, []);

  const scramble = useCallback(() => {
    const moves = generateScramble4x4(20);
    scrambleMoves.current = moves;
    setCube(applyMoves4x4(cloneCube4x4(SOLVED_CUBE_4X4), moves));
    setSolution(null);
    setCurrentStep(0);
    setError(null);
  }, []);

  const executeMove = useCallback((move: Move4x4) => {
    setCube(prev => applyMove4x4(prev, move));
    setSolution(null);
    setCurrentStep(0);
    scrambleMoves.current = null;
  }, []);

  const setFaceColor = useCallback((face: keyof CubeState4x4, index: number, color: CubeColor4x4) => {
    setCube(prev => {
      const newCube = cloneCube4x4(prev);
      newCube[face][index] = color;
      return newCube;
    });
    setSolution(null);
    setCurrentStep(0);
    setError(null);
    scrambleMoves.current = null;
  }, []);

  const setCubeState = useCallback((newCube: CubeState4x4) => {
    setCube(cloneCube4x4(newCube));
    setSolution(null);
    setCurrentStep(0);
    setError(null);
    scrambleMoves.current = null;
  }, []);

  const solve = useCallback(async () => {
    setIsSolving(true);
    setError(null);
    setSolution(null);
    setCurrentStep(0);

    try {
      if (isSolved4x4(cube)) {
        setSolution([]);
        return;
      }

      if (scrambleMoves.current) {
        const inverseSolution = trueInverseSequence(scrambleMoves.current);
        setSolution(inverseSolution);
      } else {
        setError('Manual configurations cannot be solved for 4x4. Please use the Scramble button.');
      }
    } catch (e) {
      setError('An error occurred while solving');
    } finally {
      setIsSolving(false);
    }
  }, [cube]);

  const stepForward = useCallback(() => {
    if (solution && currentStep < solution.length) {
      setCube(prev => applyMove4x4(prev, solution[currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  }, [solution, currentStep]);

  const stepBackward = useCallback(() => {
    if (solution && currentStep > 0) {
      // To step backward, undo the last applied move using M^3
      const moveToUndo = solution[currentStep - 1];
      const undoMoves = moveToUndo.includes('2') ? [moveToUndo] : [moveToUndo, moveToUndo, moveToUndo];
      setCube(prev => {
        let c = prev;
        for (const m of undoMoves) c = applyMove4x4(c, m);
        return c;
      });
      setCurrentStep(prev => prev - 1);
    }
  }, [solution, currentStep]);

  const jumpToStep = useCallback((step: number) => {
    if (!solution) return;
    
    // Rebuild from scrambled state (apply inverse of full solution, then solution up to step)
    let newCube = cloneCube4x4(SOLVED_CUBE_4X4);
    if (scrambleMoves.current) {
      newCube = applyMoves4x4(newCube, scrambleMoves.current);
    }
    
    for (let i = 0; i < step; i++) {
      newCube = applyMove4x4(newCube, solution[i]);
    }
    
    setCube(newCube);
    setCurrentStep(step);
  }, [solution]);

  return {
    cube,
    solution,
    currentStep,
    isPlaying,
    isSolving,
    error,
    isCubeSolved: isSolved4x4(cube),
    reset,
    scramble,
    executeMove,
    setFaceColor,
    setCubeState,
    solve,
    stepForward,
    stepBackward,
    jumpToStep,
    setIsPlaying,
  };
};
