import type { StageDefinition, StageMission, StageReward, StageSpecialMissionKind } from '../../data/stages';
import type { InputState } from '../input/inputState';
import type { SpecialTileKind, TileKind } from '../core/types';

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
  createdSpecialCounts: Partial<Record<SpecialTileKind, number>>;
  activatedSpecialCounts: Partial<Record<SpecialTileKind, number>>;
}

export interface StageMoveResult {
  scoreGained: number;
  removedTiles: Array<{ kind: TileKind }>;
  createdSpecials?: Array<{ specialKind: SpecialTileKind }>;
  activatedSpecials?: Array<{ specialKind: SpecialTileKind }>;
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
  createdSpecialCounts: Partial<Record<SpecialTileKind, number>>;
  activatedSpecialCounts: Partial<Record<SpecialTileKind, number>>;
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

function totalSpecialCount(counts: Partial<Record<SpecialTileKind, number>>): number {
  return Object.values(counts).reduce((sum, value) => sum + (value ?? 0), 0);
}

function specialMissionCount(
  counts: Partial<Record<SpecialTileKind, number>>,
  specialKind: StageSpecialMissionKind,
): number {
  return specialKind === 'any' ? totalSpecialCount(counts) : counts[specialKind] ?? 0;
}

function progressForMission(
  mission: StageMission,
  missionIndex: number,
  session: Pick<
    StageSession,
    | 'score'
    | 'removedTileCount'
    | 'cascadeMax'
    | 'collectedTiles'
    | 'createdSpecialCounts'
    | 'activatedSpecialCounts'
  >,
): MissionProgress {
  let current = 0;

  if (mission.type === 'score') {
    current = session.score;
  } else if (mission.type === 'collect_tile') {
    current = session.collectedTiles[mission.tileKind] ?? 0;
  } else if (mission.type === 'clear_tiles') {
    current = session.removedTileCount;
  } else if (mission.type === 'create_special') {
    current = specialMissionCount(session.createdSpecialCounts, mission.specialKind);
  } else if (mission.type === 'activate_special') {
    current = specialMissionCount(session.activatedSpecialCounts, mission.specialKind);
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
  session: Pick<
    StageSession,
    | 'score'
    | 'removedTileCount'
    | 'cascadeMax'
    | 'collectedTiles'
    | 'createdSpecialCounts'
    | 'activatedSpecialCounts'
  >,
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
    createdSpecialCounts: {},
    activatedSpecialCounts: {},
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

  const createdSpecialCounts: Partial<Record<SpecialTileKind, number>> = { ...session.createdSpecialCounts };
  for (const special of result.createdSpecials ?? []) {
    createdSpecialCounts[special.specialKind] = (createdSpecialCounts[special.specialKind] ?? 0) + 1;
  }

  const activatedSpecialCounts: Partial<Record<SpecialTileKind, number>> = { ...session.activatedSpecialCounts };
  for (const special of result.activatedSpecials ?? []) {
    activatedSpecialCounts[special.specialKind] = (activatedSpecialCounts[special.specialKind] ?? 0) + 1;
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
    createdSpecialCounts,
    activatedSpecialCounts,
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
    createdSpecialCounts: session.createdSpecialCounts,
    activatedSpecialCounts: session.activatedSpecialCounts,
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
