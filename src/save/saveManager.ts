import { coupons } from '../data/coupons';

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'haimpang_save_v1';

export type CouponStatus = 'locked' | 'available' | 'used';

export interface CouponWalletEntry {
  id: string;
  status: CouponStatus;
  usedAt: string | null;
}

export interface MemoryLogEntry {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface HaimpangSave {
  saveVersion: number;
  playerName: string;
  stars: number;
  hearts: number;
  unlockedStages: number[];
  clearedStages: number[];
  couponWallet: CouponWalletEntry[];
  usedCoupons: string[];
  achievements: string[];
  memoryLogs: MemoryLogEntry[];
  settings: {
    sound: boolean;
    vibration: boolean;
    debugPanel: boolean;
  };
  lastPlayedAt: string;
}

const createDefaultCouponWallet = (): CouponWalletEntry[] =>
  coupons.map((coupon, index) => ({
    id: coupon.id,
    status: index === 0 ? 'available' : 'locked',
    usedAt: null,
  }));

export const createDefaultSave = (): HaimpangSave => ({
  saveVersion: SAVE_VERSION,
  playerName: '효임',
  stars: 12,
  hearts: 5,
  unlockedStages: [1],
  clearedStages: [],
  couponWallet: createDefaultCouponWallet(),
  usedCoupons: [],
  achievements: [],
  memoryLogs: [
    {
      id: 'welcome',
      date: new Date().toISOString(),
      title: '하임팡 리빌드 시작',
      description: '새로운 선물 앱의 첫 화면이 열렸어요.',
    },
  ],
  settings: {
    sound: true,
    vibration: true,
    debugPanel: false,
  },
  lastPlayedAt: new Date().toISOString(),
});

export function migrateSave(rawSave: Partial<HaimpangSave> | null): HaimpangSave {
  const defaults = createDefaultSave();

  if (!rawSave || rawSave.saveVersion !== SAVE_VERSION) {
    return defaults;
  }

  return {
    ...defaults,
    ...rawSave,
    settings: {
      ...defaults.settings,
      ...rawSave.settings,
    },
    couponWallet:
      rawSave.couponWallet && rawSave.couponWallet.length > 0
        ? rawSave.couponWallet
        : defaults.couponWallet,
  };
}

export function loadSave(): HaimpangSave {
  if (typeof window === 'undefined') {
    return createDefaultSave();
  }

  const stored = window.localStorage.getItem(SAVE_KEY);
  if (!stored) {
    const defaults = createDefaultSave();
    saveGame(defaults);
    return defaults;
  }

  try {
    return migrateSave(JSON.parse(stored) as Partial<HaimpangSave>);
  } catch {
    return createDefaultSave();
  }
}

export function saveGame(save: HaimpangSave): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({ ...save, lastPlayedAt: new Date().toISOString() }),
  );
}

export function resetSave(): HaimpangSave {
  const defaults = createDefaultSave();
  saveGame(defaults);
  return defaults;
}

export function exportSave(save: HaimpangSave): string {
  return JSON.stringify(save, null, 2);
}

export function importSave(payload: string): HaimpangSave {
  return migrateSave(JSON.parse(payload) as Partial<HaimpangSave>);
}
