import { describe, expect, it } from 'vitest';
import { coupons } from '../../src/data/coupons';
import {
  createDefaultSave,
  getCouponCounts,
  unlockCoupon,
  useCoupon,
} from '../../src/save/saveManager';

describe('coupon counts', () => {
  it('counts locked, available, and used coupons', () => {
    const save = createDefaultSave();
    const counts = getCouponCounts(save);

    expect(counts.locked).toBe(coupons.length);
    expect(counts.available).toBe(0);
    expect(counts.used).toBe(0);
  });

  it('updates counts after unlock and use', () => {
    const available = unlockCoupon(createDefaultSave(), 'coffee');
    const used = useCoupon(available, 'coffee');

    expect(getCouponCounts(available)).toMatchObject({
      locked: coupons.length - 1,
      available: 1,
      used: 0,
    });
    expect(getCouponCounts(used)).toMatchObject({
      locked: coupons.length - 1,
      available: 0,
      used: 1,
    });
  });
});
