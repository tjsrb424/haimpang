import type { StageDefinition, StageMission } from '../data/stages';
import type { HaimpangSave } from '../save/saveManager';

export type StageSelectStatus = 'cleared' | 'unlocked' | 'locked';

export interface StageSelectItem {
  stage: StageDefinition;
  status: StageSelectStatus;
  missionSummary: string;
  rewardSummary: string;
  hasSpecialMission: boolean;
  recommended: boolean;
}

function summarizeMission(mission: StageMission): string {
  if (mission.type === 'collect_tile') {
    return mission.label;
  }
  if (mission.type === 'create_special' || mission.type === 'activate_special') {
    return mission.label;
  }
  return mission.label;
}

export function getStageSelectStatus(save: HaimpangSave, stageId: number): StageSelectStatus {
  if (save.clearedStages.includes(stageId)) {
    return 'cleared';
  }
  if (save.unlockedStages.includes(stageId)) {
    return 'unlocked';
  }
  return 'locked';
}

export function canStartStage(save: HaimpangSave, stageId: number): boolean {
  return getStageSelectStatus(save, stageId) !== 'locked';
}

export function getRecommendedStage(stages: StageDefinition[], save: HaimpangSave): StageDefinition {
  const unlocked = stages
    .filter((stage) => save.unlockedStages.includes(stage.id))
    .sort((a, b) => a.id - b.id);
  const uncleared = unlocked.find((stage) => !save.clearedStages.includes(stage.id));

  return uncleared ?? unlocked[unlocked.length - 1] ?? stages[0];
}

export function getMissionSummary(stage: StageDefinition): string {
  return stage.missions.map(summarizeMission).join(' / ');
}

export function getRewardSummary(stage: StageDefinition): string {
  const rewardParts = [`Stars +${stage.reward.stars}`];
  if (stage.reward.hearts) {
    rewardParts.push(`Hearts +${stage.reward.hearts}`);
  }
  if (stage.reward.couponId) {
    rewardParts.push('Coupon');
  }

  return rewardParts.join(' · ');
}

export function hasSpecialMission(stage: StageDefinition): boolean {
  return stage.missions.some(
    (mission) => mission.type === 'create_special' || mission.type === 'activate_special',
  );
}

export function buildStageSelectItems(stages: StageDefinition[], save: HaimpangSave): StageSelectItem[] {
  const recommendedStage = getRecommendedStage(stages, save);

  return stages.map((stage) => ({
    stage,
    status: getStageSelectStatus(save, stage.id),
    missionSummary: getMissionSummary(stage),
    rewardSummary: getRewardSummary(stage),
    hasSpecialMission: hasSpecialMission(stage),
    recommended: stage.id === recommendedStage.id,
  }));
}
