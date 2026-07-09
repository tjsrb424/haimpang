import { describe, expect, it } from 'vitest';
import { coupons } from '../../src/data/coupons';
import { stages } from '../../src/data/stages';

describe('stage data', () => {
  it('contains at least 20 stages with unique ids', () => {
    const ids = stages.map((stage) => stage.id);

    expect(stages.length).toBeGreaterThanOrEqual(20);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('defines move limits, missions, rewards, and seeds', () => {
    for (const stage of stages) {
      expect(stage.moveLimit).toBeGreaterThan(0);
      expect(stage.missions.length).toBeGreaterThan(0);
      expect(stage.reward.stars).toBeGreaterThan(0);
      expect(stage.seed.length).toBeGreaterThan(0);
    }
  });

  it('uses valid coupon ids for coupon rewards', () => {
    const couponIds = new Set(coupons.map((coupon) => coupon.id));
    const rewardCouponIds = stages
      .map((stage) => stage.reward.couponId)
      .filter((couponId): couponId is string => Boolean(couponId));

    expect(rewardCouponIds.length).toBeGreaterThan(0);
    for (const couponId of rewardCouponIds) {
      expect(couponIds.has(couponId)).toBe(true);
    }
  });
});
