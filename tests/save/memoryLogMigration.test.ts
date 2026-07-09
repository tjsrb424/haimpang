import { describe, expect, it } from 'vitest';
import {
  createDefaultSave,
  migrateSave,
  unlockCoupon,
  useCoupon,
  type HaimpangSave,
} from '../../src/save/saveManager';

describe('memory log migration', () => {
  it('adds system category to legacy memory logs without a category', () => {
    const legacy = {
      ...createDefaultSave(),
      memoryLogs: [
        {
          id: 'legacy',
          date: '2026-07-01T00:00:00.000Z',
          title: 'Legacy log',
          description: 'Saved before memory categories.',
        },
      ],
    };
    const migrated = migrateSave(legacy as unknown as Partial<HaimpangSave>);

    expect(migrated.memoryLogs[0]).toMatchObject({
      id: 'legacy',
      category: 'system',
    });
  });

  it('keeps stage clear category during migration', () => {
    const legacy = {
      ...createDefaultSave(),
      memoryLogs: [
        {
          id: 'stage-1-clear',
          date: '2026-07-01T00:00:00.000Z',
          title: 'Stage clear',
          description: 'Stage clear log.',
        },
      ],
    };
    const migrated = migrateSave(legacy as unknown as Partial<HaimpangSave>);

    expect(migrated.memoryLogs[0].category).toBe('stage_clear');
  });

  it('allows coupon used logs after migration', () => {
    const migrated = migrateSave(createDefaultSave());
    const used = useCoupon(unlockCoupon(migrated, 'coffee'), 'coffee');

    expect(used.memoryLogs[0].category).toBe('coupon_used');
  });
});
