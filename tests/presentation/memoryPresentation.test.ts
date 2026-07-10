import { describe, expect, it } from 'vitest';
import { getMemoryPresentation } from '../../src/game/presentation/memoryPresentation';
import type { MemoryLogEntry } from '../../src/save/saveManager';

function log(id: string, title: string, description: string): MemoryLogEntry {
  return { id, title, description, date: '2026-07-10T00:00:00.000Z', category: 'stage_clear' };
}

describe('memory presentation', () => {
  it('localizes legacy stage clear records by stable id', () => {
    expect(getMemoryPresentation(log('stage-1-clear', 'First box opened', 'English copy'))).toEqual(
      {
        title: '첫 번째 선물 상자 완료',
        description: '첫 번째 선물 상자 선물을 열고 추억으로 남겼어요.',
      },
    );
  });

  it('localizes the legacy welcome record', () => {
    expect(getMemoryPresentation(log('welcome', 'HAIMPANG opened', 'English copy')).title).toBe(
      '하임팡 시작',
    );
  });

  it('preserves already localized or unknown records', () => {
    expect(
      getMemoryPresentation(log('coupon-coffee-unlock', '커피 쿠폰 해금', '준비됐어요.')),
    ).toEqual({ title: '커피 쿠폰 해금', description: '준비됐어요.' });
  });
});
