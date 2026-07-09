import type { StageDefinition, StageMission, StageReward } from '../../data/stages';
import type { InputState } from '../input/inputState';
import type { TileKind } from '../core/types';

export type StageStatus = 'playing' | 'won' | 'lost';

export interface MissionProgress {
  missionIndex: number;
  label: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface StageSession {
  stageId: number;
  status: StageStatus;
  score: number;
  movesUsed: number;
  movesRemaining: number;
  missionProgress: MissionProgress[];
  cascadeMax: number;
  removedTileCount: number;
  collectedTiles: Partial<Record<TileKind, number>>;
}

export interface StageMoveResult {
  scoreGained: number;
  removedTiles: Array<{ kind: TileKind }>;
  cascadeCount: number;
  validMove: boolean;
}

export interface StageProgressSummary {
  stageId: number;
  status: StageStatus;
  score: number;
  movesUsed: number;
  movesRemaining: number;
  missionProgress: MissionProgress[];
  cascadeMax: number;
  removedTileCount: number;
  inputState: InputState;
}

export interface StageFinishResult {
  stageId: number;
  status: 'won' | 'lost';
  score: number;
  movesUsed: number;
  movesRemaining: number;
  missionProgress: MissionProgress[];
  reward?: StageReward;
  firstClear: boolean;
}

function clampProgress(current: number, required: number): number {
  return Math.min(current, required);
}

function progressForMission(
  mission: StageMission,
  missionIndex: number,
  session: Pick<StageSession, 'score' | 'removedTileCount' | 'cascadeMax' | 'collectedTiles'>,
): MissionProgress {
  let current = 0;

  if (mission.type === 'score') {
    current = session.score;
  } else if (mission.type === 'collect_tile') {
    current = session.collectedTiles[mission.tileKind] ?? 0;
  } else if (mission.type === 'clear_tiles') {
    current = session.removedTileCount;
  } else {
    current = session.cascadeMax;
  }

  return {
    missionIndex,
    label: mission.label,
    current: clampProgress(current, mission.required),
    required: mission.required,
    completed: current >= mission.required,
  };
}

export function calculateMissionProgress(
  stage: StageDefinition,
  session: Pick<StageSession, 'score' | 'removedTileCount' | 'cascadeMax' | 'collectedTiles'>,
): MissionProgress[] {
  return stage.missions.map((mission, index) => progressForMission(mission, index, session));
}

export function evaluateStageStatus(session: StageSession, stage: StageDefinition): StageStatus {
  void stage;
  if (session.missionProgress.every((mission) => mission.completed)) {
    return 'won';
  }

  if (session.movesRemaining <= 0) {
    return 'lost';
  }

  return 'playing';
}

export function createStageSession(stage: StageDefinition): StageSession {
  const baseSession: StageSession = {
    stageId: stage.id,
    status: 'playing',
    score: 0,
    movesUsed: 0,
    movesRemaining: stage.moveLimit,
    missionProgress: [],
    cascadeMax: 0,
    removedTileCount: 0,
    collectedTiles: {},
  };

  return {
    ...baseSession,
    missionProgress: calculateMissionProgress(stage, baseSession),
  };
}

export function applyMoveResult(
  session: StageSession,
  result: StageMoveResult,
  stage: StageDefinition,
): StageSession {
  if (session.status !== 'playing') {
    return session;
  }

  const collectedTiles: Partial<Record<TileKind, number>> = { ...session.collectedTiles };
  for (const tile of result.removedTiles) {
    collectedTiles[tile.kind] = (collectedTiles[tile.kind] ?? 0) + 1;
  }

  const movesUsed = session.movesUsed + (result.validMove ? 1 : 0);
  const nextBase: StageSession = {
    ...session,
    score: session.score + result.scoreGained,
    movesUsed,
    movesRemaining: Math.max(0, stage.moveLimit - movesUsed),
    cascadeMax: Math.max(session.cascadeMax, result.cascadeCount),
    removedTileCount: session.removedTileCount + result.removedTiles.length,
    collectedTiles,
  };

  const missionProgress = calculateMissionProgress(stage, nextBase);
  const withProgress: StageSession = {
    ...nextBase,
    missionProgress,
  };

  return {
    ...withProgress,
    status: evaluateStageStatus(withProgress, stage),
  };
}

export function toStageProgressSummary(
  session: StageSession,
  inputState: InputState,
): StageProgressSummary {
  return {
    stageId: session.stageId,
    status: session.status,
    score: session.score,
    movesUsed: session.movesUsed,
    movesRemaining: session.movesRemaining,
    missionProgress: session.missionProgress,
    cascadeMax: session.cascadeMax,
    removedTileCount: session.removedTileCount,
    inputState,
  };
}

export function toStageFinishResult(
  session: StageSession,
  stage: StageDefinition,
): StageFinishResult | null {
  if (session.status === 'playing') {
    return null;
  }

  return {
    stageId: session.stageId,
    status: session.status,
    score: session.score,
    movesUsed: session.movesUsed,
    movesRemaining: session.movesRemaining,
    missionProgress: session.missionProgress,
    reward: session.status === 'won' ? stage.reward : undefined,
    firstClear: false,
  };
}
