import { useState, useCallback } from 'react';
import { CubeState2x2, Move2x2, CubeColor2x2, SOLVED_CUBE_2X2 } from '@/types/cube2x2';
import { applyMove2x2, applyMoves2x2, generateScramble2x2, cloneCube2x2, isSolved2x2, solve2x2 } from '@/lib/cube2x2Utils';

export const useCube2x2 = () => {
  const [cube, setCube] = useState<CubeState2x2>(cloneCube2x2(SOLVED_CUBE_2X2));
  const [solution, setSolution] = useState<Move2x2[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setCube(cloneCube2x2(SOLVED_CUBE_2X2));
    setSolution(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setError(null);
  }, []);

  const scramble = useCallback(() => {
    const moves = generateScramble2x2(10);
    setCube(applyMoves2x2(cloneCube2x2(SOLVED_CUBE_2X2), moves));
    setSolution(null);
    setCurrentStep(0);
    setError(null);
  }, []);

  const executeMove = useCallback((move: Move2x2) => {
    setCube(prev => applyMove2x2(prev, move));
    setSolution(null);
    setCurrentStep(0);
  }, []);

  const setFaceColor = useCallback((face: keyof CubeState2x2, index: number, color: CubeColor2x2) => {
    setCube(prev => {
      const newCube = cloneCube2x2(prev);
      newCube[face][index] = color;
      return newCube;
    });
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
      const result = solve2x2(cube);
      
      if (result) {
        setSolution(result);
      } else {
        setError('Could not find solution. Check your cube configuration.');
      }
    } catch (e) {
      setError('An error occurred while solving');
    } finally {
      setIsSolving(false);
    }
  }, [cube]);

  const stepForward = useCallback(() => {
    if (solution && currentStep < solution.length) {
      setCube(prev => applyMove2x2(prev, solution[currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  }, [solution, currentStep]);

  const stepBackward = useCallback(() => {
    if (solution && currentStep > 0) {
      const moveToUndo = solution[currentStep - 1];
      const inverseMove = moveToUndo.includes("'") 
        ? moveToUndo.replace("'", '') as Move2x2
        : moveToUndo.includes('2') 
          ? moveToUndo 
          : (moveToUndo + "'") as Move2x2;
      setCube(prev => applyMove2x2(prev, inverseMove));
      setCurrentStep(prev => prev - 1);
    }
  }, [solution, currentStep]);

  const jumpToStep = useCallback((step: number) => {
    if (!solution) return;
    
    let newCube = cloneCube2x2(SOLVED_CUBE_2X2);
    
    for (let i = solution.length - 1; i >= 0; i--) {
      const move = solution[i];
      const inverseMove = move.includes("'") 
        ? move.replace("'", '') as Move2x2
        : move.includes('2') 
          ? move 
          : (move + "'") as Move2x2;
      newCube = applyMove2x2(newCube, inverseMove);
    }
    
    for (let i = 0; i < step; i++) {
      newCube = applyMove2x2(newCube, solution[i]);
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
    isCubeSolved: isSolved2x2(cube),
    reset,
    scramble,
    executeMove,
    setFaceColor,
    solve,
    stepForward,
    stepBackward,
    jumpToStep,
    setIsPlaying,
  };
};
