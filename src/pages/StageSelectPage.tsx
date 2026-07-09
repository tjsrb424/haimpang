import { SectionHeader } from '../components/SectionHeader';
import { stages } from '../data/stages';
import type { HaimpangSave } from '../save/saveManager';
import { buildStageSelectItems, canStartStage } from '../stage/stageSelect';

interface StageSelectPageProps {
  save: HaimpangSave;
  onStartStage: (stageId: number) => void;
  onHome: () => void;
}

const statusLabel = {
  cleared: '클리어',
  unlocked: '플레이 가능',
  locked: '잠금',
} as const;

export function StageSelectPage({ save, onStartStage, onHome }: StageSelectPageProps) {
  const items = buildStageSelectItems(stages, save);

  return (
    <section className="page-stack stage-select-page">
      <SectionHeader
        eyebrow="스테이지 선택"
        title="오늘 열 선물 상자 고르기"
        description="열린 스테이지는 다시 플레이할 수 있고, 잠긴 스테이지는 이전 선물을 먼저 열어야 해요."
      />

      <div className="stage-select-actions">
        <button type="button" className="secondary-button" onClick={onHome}>
          홈으로
        </button>
      </div>

      <div className="stage-grid">
        {items.map((item) => (
          <article
            className={`stage-card ${item.status}${item.recommended ? ' recommended' : ''}`}
            key={item.stage.id}
          >
            <div className="stage-card-head">
              <span className={`stage-state ${item.status}`}>{statusLabel[item.status]}</span>
              {item.recommended && <span className="stage-state recommended">추천</span>}
            </div>
            <div>
              <p className="eyebrow">Stage {item.stage.id}</p>
              <h3>{item.stage.title}</h3>
              <p>{item.missionSummary}</p>
            </div>
            <div className="stage-card-meta">
              <span>{item.rewardSummary}</span>
              {item.hasSpecialMission && <span>특수 미션</span>}
            </div>
            <button
              type="button"
              className={item.status === 'locked' ? 'secondary-button locked-action' : 'primary-button'}
              disabled={!canStartStage(save, item.stage.id)}
              onClick={() => onStartStage(item.stage.id)}
            >
              {item.status === 'locked' ? '이전 스테이지 필요' : item.status === 'cleared' ? '다시 하기' : '시작하기'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
