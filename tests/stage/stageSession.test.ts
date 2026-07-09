import { describe, expect, it } from 'vitest';
import type { StageDefinition } from '../../src/data/stages';
import {
  applyMoveResult,
  createStageSession,
  evaluateStageStatus,
} from '../../src/game/session/stageSession';

const baseStage: StageDefinition = {
  id: 101,
  title: 'Test Stage',
  moveLimit: 3,
  missions: [{ type: 'score', required: 50, label: 'Score 50' }],
  reward: { stars: 1 },
  seed: 'test-stage',
};

describe('stageSession', () => {
  it('creates a session from moveLimit', () => {
    const session = createStageSession(baseStage);

    expect(session.movesRemaining).toBe(3);
    expect(session.movesUsed).toBe(0);
    expect(session.status).toBe('playing');
  });

  it('increments movesUsed only for valid moves', () => {
    const first = applyMoveResult(
      createStageSession(baseStage),
      { scoreGained: 0, removedTiles: [], cascadeCount: 0, validMove: false },
      baseStage,
    );
    const second = applyMoveResult(
      first,
      { scoreGained: 10, removedTiles: [], cascadeCount: 1, validMove: true },
      baseStage,
    );

    expect(first.movesUsed).toBe(0);
    expect(second.movesUsed).toBe(1);
    expect(second.movesRemaining).toBe(2);
  });

  it('updates score mission progress', () => {
    const session = applyMoveResult(
      createStageSession(baseStage),
      { scoreGained: 30, removedTiles: [], cascadeCount: 1, validMove: true },
      baseStage,
    );

    expect(session.score).toBe(30);
    expect(session.missionProgress[0]).toMatchObject({ current: 30, completed: false });
  });

  it('updates collect_tile progress', () => {
    const stage: StageDefinition = {
      ...baseStage,
      missions: [{ type: 'collect_tile', tileKind: 'heart', required: 2, label: 'Collect hearts' }],
    };
    const session = applyMoveResult(
      createStageSession(stage),
      {
        scoreGained: 0,
        removedTiles: [{ kind: 'heart' }, { kind: 'star' }, { kind: 'heart' }],
        cascadeCount: 1,
        validMove: true,
      },
      stage,
    );

    expect(session.missionProgress[0]).toMatchObject({ current: 2, completed: true });
  });

  it('updates clear_tiles and cascade progress', () => {
    const stage: StageDefinition = {
      ...baseStage,
      missions: [
        { type: 'clear_tiles', required: 3, label: 'Clear tiles' },
        { type: 'cascade', required: 2, label: 'Cascade' },
      ],
    };
    const session = applyMoveResult(
      createStageSession(stage),
      {
        scoreGained: 0,
        removedTiles: [{ kind: 'heart' }, { kind: 'star' }, { kind: 'gift' }],
        cascadeCount: 2,
        validMove: true,
      },
      stage,
    );

    expect(session.missionProgress.every((mission) => mission.completed)).toBe(true);
    expect(session.status).toBe('won');
  });

  it('marks all missions complete as won', () => {
    const session = applyMoveResult(
      createStageSession(baseStage),
      { scoreGained: 50, removedTiles: [], cascadeCount: 1, validMove: true },
      baseStage,
    );

    expect(evaluateStageStatus(session, baseStage)).toBe('won');
  });

  it('marks zero moves with incomplete missions as lost', () => {
    const stage: StageDefinition = { ...baseStage, moveLimit: 1 };
    const session = applyMoveResult(
      createStageSession(stage),
      { scoreGained: 0, removedTiles: [], cascadeCount: 1, validMove: true },
      stage,
    );

    expect(session.movesRemaining).toBe(0);
    expect(session.status).toBe('lost');
  });

  it('allows the final move cascade to win instead of lose', () => {
    const stage: StageDefinition = { ...baseStage, moveLimit: 1 };
    const session = applyMoveResult(
      createStageSession(stage),
      { scoreGained: 50, removedTiles: [], cascadeCount: 2, validMove: true },
      stage,
    );

    expect(session.movesRemaining).toBe(0);
    expect(session.status).toBe('won');
  });
});
