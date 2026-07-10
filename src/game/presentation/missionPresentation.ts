import type { StageMission, StageSpecialMissionKind } from '../../data/stages';
import type { SpecialTileKind } from '../core/types';
import { getTileDisplayName } from './tilePresentation';

const specialNames: Record<StageSpecialMissionKind, string> = {
  line_horizontal: '가로 빛띠',
  line_vertical: '세로 빛띠',
  bomb: '베리 폭탄',
  rainbow: '프리즘 베리',
  any: '특수 베리',
};

export function getSpecialDisplayName(kind: StageSpecialMissionKind | SpecialTileKind): string {
  return specialNames[kind];
}

export function getMissionDisplayLabel(mission: StageMission): string {
  if (mission.type === 'collect_tile') {
    return `${getTileDisplayName(mission.tileKind)} 모으기`;
  }
  if (mission.type === 'score') {
    return '목표 점수';
  }
  if (mission.type === 'clear_tiles') {
    return '베리 팡팡';
  }
  if (mission.type === 'cascade') {
    return `${mission.required}콤보 만들기`;
  }
  if (mission.type === 'create_special') {
    return `${getSpecialDisplayName(mission.specialKind)} 만들기`;
  }
  return `${getSpecialDisplayName(mission.specialKind)} 터뜨리기`;
}

export function getMissionSummaryText(mission: StageMission): string {
  return `${getMissionDisplayLabel(mission)} ${mission.required}`;
}
