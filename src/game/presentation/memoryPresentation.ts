import type { MemoryLogEntry } from '../../save/saveManager';
import { getStageDisplayName } from './stagePresentation';

export interface MemoryPresentation {
  title: string;
  description: string;
}

export function getMemoryPresentation(log: MemoryLogEntry): MemoryPresentation {
  if (log.id === 'welcome') {
    return {
      title: '하임팡 시작',
      description: '첫 번째 작은 선물 앱 화면이 준비됐어요.',
    };
  }

  const stageClearMatch = /^stage-(\d+)-clear$/.exec(log.id);
  if (stageClearMatch) {
    const stageId = Number(stageClearMatch[1]);
    const stageName = getStageDisplayName(stageId);
    return {
      title: `${stageName} 완료`,
      description: `${stageName} 선물을 열고 추억으로 남겼어요.`,
    };
  }

  return { title: log.title, description: log.description };
}
