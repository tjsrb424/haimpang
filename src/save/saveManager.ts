import { coupons } from '../data/coupons';
import { stages, type StageDefinition } from '../data/stages';

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'haimpang_save_v1';

export type CouponStatus = 'locked' | 'available' | 'used';
export type MemoryLogCategory = 'system' | 'stage_clear' | 'coupon_unlock' | 'coupon_used' | 'special';

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
  category: MemoryLogCategory;
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

function uniqueNumbers(values: number[]): number[] {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

const createDefaultCouponWallet = (): CouponWalletEntry[] =>
  coupons.map((coupon) => ({
    id: coupon.id,
    status: 'locked',
    usedAt: null,
  }));

function mergeCouponWallet(rawWallet: CouponWalletEntry[] | undefined): CouponWalletEntry[] {
  const rawById = new Map((rawWallet ?? []).map((entry) => [entry.id, entry]));
  return coupons.map((coupon) => {
    const existing = rawById.get(coupon.id);
    return {
      id: coupon.id,
      status: existing?.status ?? 'locked',
      usedAt: existing?.usedAt ?? null,
    };
  });
}

function normalizeMemoryLog(log: Partial<MemoryLogEntry>, index: number): MemoryLogEntry {
  return {
    id: log.id ?? `memory-${index}`,
    date: log.date ?? new Date().toISOString(),
    title: log.title ?? 'HAIMPANG memory',
    description: log.description ?? 'A small HAIMPANG memory was saved.',
    category: log.category ?? (log.id?.startsWith('stage-') ? 'stage_clear' : 'system'),
  };
}

function mergeMemoryLogs(rawLogs: Array<Partial<MemoryLogEntry>> | undefined): MemoryLogEntry[] {
  if (!rawLogs || rawLogs.length === 0) {
    return createDefaultSave().memoryLogs;
  }

  return rawLogs.map(normalizeMemoryLog);
}

export const createDefaultSave = (): HaimpangSave => ({
  saveVersion: SAVE_VERSION,
  playerName: 'Haim',
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
      title: 'HAIMPANG opened',
      description: 'The first little gift app screen is ready.',
      category: 'system',
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
    unlockedStages: uniqueNumbers(rawSave.unlockedStages && rawSave.unlockedStages.length > 0 ? rawSave.unlockedStages : defaults.unlockedStages),
    clearedStages: uniqueNumbers(rawSave.clearedStages ?? []),
    settings: {
      ...defaults.settings,
      ...rawSave.settings,
    },
    couponWallet: mergeCouponWallet(rawSave.couponWallet),
    usedCoupons: uniqueStrings(rawSave.usedCoupons ?? []),
    memoryLogs: mergeMemoryLogs(rawSave.memoryLogs),
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

export function isStageCleared(save: HaimpangSave, stageId: number): boolean {
  return save.clearedStages.includes(stageId);
}

export function isStageUnlocked(save: HaimpangSave, stageId: number): boolean {
  return save.unlockedStages.includes(stageId);
}

export function unlockCoupon(save: HaimpangSave, couponId: string): HaimpangSave {
  const exists = coupons.some((coupon) => coupon.id === couponId);
  if (!exists) {
    return save;
  }

  return {
    ...save,
    couponWallet: mergeCouponWallet(save.couponWallet).map((entry) =>
      entry.id === couponId && entry.status === 'locked'
        ? {
            ...entry,
            status: 'available',
          }
        : entry,
    ),
  };
}

export function getCouponStatus(save: HaimpangSave, couponId: string): CouponStatus {
  return mergeCouponWallet(save.couponWallet).find((entry) => entry.id === couponId)?.status ?? 'locked';
}

export function getCouponCounts(save: HaimpangSave): Record<CouponStatus, number> {
  return mergeCouponWallet(save.couponWallet).reduce(
    (counts, entry) => ({
      ...counts,
      [entry.status]: counts[entry.status] + 1,
    }),
    { locked: 0, available: 0, used: 0 },
  );
}

export function useCoupon(save: HaimpangSave, couponId: string): HaimpangSave {
  const coupon = coupons.find((candidate) => candidate.id === couponId);
  if (!coupon) {
    return save;
  }

  const wallet = mergeCouponWallet(save.couponWallet);
  const entry = wallet.find((candidate) => candidate.id === couponId);
  if (!entry || entry.status !== 'available') {
    return save;
  }

  const now = new Date().toISOString();

  return {
    ...save,
    couponWallet: wallet.map((candidate) =>
      candidate.id === couponId
        ? {
            ...candidate,
            status: 'used',
            usedAt: now,
          }
        : candidate,
    ),
    usedCoupons: uniqueStrings([...save.usedCoupons, couponId]),
    memoryLogs: [
      {
        id: `coupon-${couponId}-used-${now}`,
        date: now,
        title: coupon.memoryTitle,
        description: coupon.memoryDescription,
        category: 'coupon_used',
      },
      ...save.memoryLogs,
    ],
    lastPlayedAt: now,
  };
}

function nextStageId(stageId: number): number | null {
  return stages.some((stage) => stage.id === stageId + 1) ? stageId + 1 : null;
}

export function applyStageClearReward(save: HaimpangSave, stage: StageDefinition): HaimpangSave {
  const now = new Date().toISOString();
  const nextId = nextStageId(stage.id);
  const unlockedStages = uniqueNumbers([
    ...save.unlockedStages,
    stage.id,
    ...(nextId ? [nextId] : []),
  ]);

  if (isStageCleared(save, stage.id)) {
    return {
      ...save,
      unlockedStages,
      couponWallet: mergeCouponWallet(save.couponWallet),
      lastPlayedAt: now,
    };
  }

  const reward = stage.reward;
  const withCoupon = reward.couponId ? unlockCoupon(save, reward.couponId) : save;
  const coupon = reward.couponId ? coupons.find((candidate) => candidate.id === reward.couponId) : undefined;
  const couponWasLocked =
    reward.couponId !== undefined &&
    mergeCouponWallet(save.couponWallet).find((entry) => entry.id === reward.couponId)?.status === 'locked';
  const stageClearLog: MemoryLogEntry | null = reward.memoryTitle
    ? {
        id: `stage-${stage.id}-clear`,
        date: now,
        title: reward.memoryTitle,
        description: reward.memoryDescription ?? `${stage.title} cleared.`,
        category: 'stage_clear',
      }
    : null;
  const couponUnlockLog: MemoryLogEntry | null =
    coupon && couponWasLocked
      ? {
          id: `coupon-${coupon.id}-unlock`,
          date: now,
          title: `${coupon.title} 해금`,
          description: `${coupon.title}이 지갑에서 사용 가능해졌어요.`,
          category: 'coupon_unlock',
        }
      : null;
  const nextMemoryLogs = [stageClearLog, couponUnlockLog].filter(
    (log): log is MemoryLogEntry => Boolean(log),
  );
  const nextMemoryLogIds = new Set(nextMemoryLogs.map((log) => log.id));
  const memoryLogs =
    nextMemoryLogs.length > 0
      ? [...nextMemoryLogs, ...save.memoryLogs.filter((log) => !nextMemoryLogIds.has(log.id))]
      : save.memoryLogs;

  return {
    ...withCoupon,
    stars: save.stars + reward.stars,
    hearts: save.hearts + (reward.hearts ?? 0),
    unlockedStages,
    clearedStages: uniqueNumbers([...save.clearedStages, stage.id]),
    couponWallet: mergeCouponWallet(withCoupon.couponWallet),
    memoryLogs,
    lastPlayedAt: now,
  };
}
