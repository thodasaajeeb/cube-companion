import { useState, useCallback } from 'react';
import { CubeState4x4, Move4x4, CubeColor4x4, SOLVED_CUBE_4X4 } from '@/types/cube4x4';
import { applyMove4x4, applyMoves4x4, generateScramble4x4, cloneCube4x4, isSolved4x4 } from '@/lib/cube4x4Utils';
import { solve4x4Reduction } from '@/lib/cube4x4Solver';

export const useCube4x4 = () => {
  const [cube, setCube] = useState<CubeState4x4>(cloneCube4x4(SOLVED_CUBE_4X4));
  const [solution, setSolution] = useState<Move4x4[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setCube(cloneCube4x4(SOLVED_CUBE_4X4));
    setSolution(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setError(null);
  }, []);

  const scramble = useCallback(() => {
    const moves = generateScramble4x4(8);
    setCube(applyMoves4x4(cloneCube4x4(SOLVED_CUBE_4X4), moves));
    setSolution(null);
    setCurrentStep(0);
    setError(null);
  }, []);

  const executeMove = useCallback((move: Move4x4) => {
    setCube(prev => applyMove4x4(prev, move));
    setSolution(null);
    setCurrentStep(0);
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
  }, []);

  const setCubeState = useCallback((newCube: CubeState4x4) => {
    setCube(cloneCube4x4(newCube));
    setSolution(null);
    setCurrentStep(0);
    setError(null);
  }, []);

  const solve = useCallback(async () => {
    setIsSolving(true);
    setError(null);
    setSolution(null);
    setCurrentStep(0);

    try {
      const result = await solve4x4Reduction(cube);
      
      if (result.success && result.solution) {
        setSolution(result.solution);
      } else {
        setError(result.error || 'Failed to solve cube');
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
      const moveToUndo = solution[currentStep - 1];
      const inverseMove = moveToUndo.includes("'") 
        ? moveToUndo.replace("'", '') as Move4x4
        : moveToUndo.includes('2') 
          ? moveToUndo 
          : (moveToUndo + "'") as Move4x4;
      setCube(prev => applyMove4x4(prev, inverseMove));
      setCurrentStep(prev => prev - 1);
    }
  }, [solution, currentStep]);

  const jumpToStep = useCallback((step: number) => {
    if (!solution) return;
    
    let newCube = cloneCube4x4(SOLVED_CUBE_4X4);
    
    for (let i = solution.length - 1; i >= 0; i--) {
      const move = solution[i];
      const inverseMove = move.includes("'") 
        ? move.replace("'", '') as Move4x4
        : move.includes('2') 
          ? move 
          : (move + "'") as Move4x4;
      newCube = applyMove4x4(newCube, inverseMove);
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
