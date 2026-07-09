import type { StageData } from '../../data/stages';

export interface StageProgress {
  score: number;
  movesLeft: number;
  isWin: boolean;
  isLose: boolean;
}

export function createInitialStageProgress(stage: StageData): StageProgress {
  return {
    score: 0,
    movesLeft: stage.moveLimit,
    isWin: false,
    isLose: false,
  };
}
