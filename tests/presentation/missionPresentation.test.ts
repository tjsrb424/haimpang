import { describe, expect, it } from 'vitest';
import type { StageMission } from '../../src/data/stages';
import {
  getMissionDisplayLabel,
  getMissionSummaryText,
  getSpecialDisplayName,
} from '../../src/game/presentation/missionPresentation';

describe('mission presentation', () => {
  it('shows berry names instead of internal tile kinds', () => {
    const mission: StageMission = {
      type: 'collect_tile',
      tileKind: 'heart',
      required: 20,
      label: 'legacy label',
    };

    expect(getMissionDisplayLabel(mission)).toBe('딸기 모으기');
    expect(getMissionSummaryText(mission)).toBe('딸기 모으기 20');
    expect(getMissionSummaryText(mission)).not.toContain('heart');
  });

  it('provides shape-based Korean names for every special overlay', () => {
    expect(getSpecialDisplayName('line_horizontal')).toBe('가로 빛띠');
    expect(getSpecialDisplayName('line_vertical')).toBe('세로 빛띠');
    expect(getSpecialDisplayName('bomb')).toBe('베리 폭탄');
    expect(getSpecialDisplayName('rainbow')).toBe('프리즘 베리');
  });

  it('does not expose frozen English stage labels', () => {
    const mission: StageMission = { type: 'score', required: 300, label: 'Score 300' };
    expect(getMissionSummaryText(mission)).toBe('목표 점수 300');
    expect(getMissionSummaryText(mission)).not.toMatch(/Score|Moves|COMBO/);
  });
});
