import { describe, expect, it } from 'vitest';
import { stages } from '../../src/data/stages';
import {
  applyStageClearReward,
  createDefaultSave,
  exportSave,
  importSave,
  isStageCleared,
  isStageUnlocked,
  unlockCoupon,
} from '../../src/save/saveManager';

describe('stage clear rewards', () => {
  it('grants first-clear stars, clear state, next unlock, coupon, and memory', () => {
    const save = createDefaultSave();
    const stage = stages[0];
    const next = applyStageClearReward(save, stage);

    expect(next.stars).toBe(save.stars + stage.reward.stars);
    expect(isStageCleared(next, stage.id)).toBe(true);
    expect(isStageUnlocked(next, stage.id + 1)).toBe(true);
    expect(next.couponWallet.find((entry) => entry.id === stage.reward.couponId)?.status).toBe('available');
    expect(next.memoryLogs[0]?.id).toBe(`stage-${stage.id}-clear`);
  });

  it('does not grant duplicate rewards for an already-cleared stage', () => {
    const save = createDefaultSave();
    const stage = stages[0];
    const first = applyStageClearReward(save, stage);
    const second = applyStageClearReward(first, stage);

    expect(second.stars).toBe(first.stars);
    expect(second.hearts).toBe(first.hearts);
    expect(second.memoryLogs.filter((log) => log.id === `stage-${stage.id}-clear`)).toHaveLength(1);
  });

  it('does not downgrade available or used coupons', () => {
    const save = unlockCoupon(createDefaultSave(), 'coffee');
    const used = {
      ...save,
      couponWallet: save.couponWallet.map((entry) =>
        entry.id === 'coffee' ? { ...entry, status: 'used' as const, usedAt: 'now' } : entry,
      ),
    };

    expect(unlockCoupon(save, 'coffee').couponWallet.find((entry) => entry.id === 'coffee')?.status).toBe('available');
    expect(unlockCoupon(used, 'coffee').couponWallet.find((entry) => entry.id === 'coffee')?.status).toBe('used');
  });

  it('preserves stage clear data through export and import', () => {
    const cleared = applyStageClearReward(createDefaultSave(), stages[0]);
    const imported = importSave(exportSave(cleared));

    expect(imported.clearedStages).toContain(stages[0].id);
    expect(imported.unlockedStages).toContain(stages[1].id);
    expect(imported.couponWallet.find((entry) => entry.id === stages[0].reward.couponId)?.status).toBe('available');
    expect(imported.memoryLogs.some((log) => log.id === `stage-${stages[0].id}-clear`)).toBe(true);
  });
});
