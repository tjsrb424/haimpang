import { describe, expect, it } from 'vitest';
import {
  createDefaultSave,
  getCouponStatus,
  unlockCoupon,
  useCoupon,
} from '../../src/save/saveManager';

describe('coupon use flow', () => {
  it('marks an available coupon used with usedAt, usedCoupons, and memory log', () => {
    const save = unlockCoupon(createDefaultSave(), 'coffee');
    const next = useCoupon(save, 'coffee');
    const walletEntry = next.couponWallet.find((entry) => entry.id === 'coffee');

    expect(walletEntry?.status).toBe('used');
    expect(walletEntry?.usedAt).toBeTruthy();
    expect(next.usedCoupons).toContain('coffee');
    expect(next.memoryLogs[0]).toMatchObject({
      category: 'coupon_used',
      title: '커피 쿠폰 사용',
    });
  });

  it('does not use locked coupons', () => {
    const save = createDefaultSave();
    const next = useCoupon(save, 'coffee');

    expect(next).toBe(save);
    expect(getCouponStatus(next, 'coffee')).toBe('locked');
  });

  it('does not duplicate an already used coupon', () => {
    const save = useCoupon(unlockCoupon(createDefaultSave(), 'coffee'), 'coffee');
    const next = useCoupon(save, 'coffee');

    expect(next).toBe(save);
    expect(next.usedCoupons.filter((couponId) => couponId === 'coffee')).toHaveLength(1);
    expect(next.memoryLogs.filter((log) => log.category === 'coupon_used')).toHaveLength(1);
  });

  it('keeps save shape for unknown coupon ids', () => {
    const save = createDefaultSave();
    const next = useCoupon(save, 'missing-coupon');

    expect(next).toBe(save);
    expect(next.couponWallet).toHaveLength(save.couponWallet.length);
  });
});
