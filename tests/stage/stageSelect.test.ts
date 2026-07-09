import { describe, expect, it } from 'vitest';
import { stages } from '../../src/data/stages';
import { createDefaultSave } from '../../src/save/saveManager';
import {
  buildStageSelectItems,
  canStartStage,
  getRecommendedStage,
  getStageSelectStatus,
} from '../../src/stage/stageSelect';

describe('stage select helpers', () => {
  it('calculates cleared, unlocked, and locked states', () => {
    const save = {
      ...createDefaultSave(),
      unlockedStages: [1, 2],
      clearedStages: [1],
    };

    expect(getStageSelectStatus(save, 1)).toBe('cleared');
    expect(getStageSelectStatus(save, 2)).toBe('unlocked');
    expect(getStageSelectStatus(save, 3)).toBe('locked');
  });

  it('recommends the lowest unlocked uncleared stage', () => {
    const save = {
      ...createDefaultSave(),
      unlockedStages: [1, 2, 3],
      clearedStages: [1],
    };

    expect(getRecommendedStage(stages, save).id).toBe(2);
  });

  it('falls back to the last unlocked stage when everything unlocked is cleared', () => {
    const save = {
      ...createDefaultSave(),
      unlockedStages: [1, 2],
      clearedStages: [1, 2],
    };

    expect(getRecommendedStage(stages, save).id).toBe(2);
  });

  it('guards locked stage starts', () => {
    const save = createDefaultSave();

    expect(canStartStage(save, 1)).toBe(true);
    expect(canStartStage(save, 2)).toBe(false);
  });

  it('builds list items with special mission markers', () => {
    const save = {
      ...createDefaultSave(),
      unlockedStages: [1, 2, 3, 4, 5, 6],
    };
    const items = buildStageSelectItems(stages, save);
    const stage6 = items.find((item) => item.stage.id === 6);

    expect(items).toHaveLength(stages.length);
    expect(stage6?.hasSpecialMission).toBe(true);
    expect(stage6?.status).toBe('unlocked');
  });
});
