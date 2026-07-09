import { stages } from '../data/stages';
import type { HaimpangSave } from '../save/saveManager';
import { SectionHeader } from '../components/SectionHeader';

interface HomePageProps {
  save: HaimpangSave;
  onStartGame: () => void;
  onOpenWallet: () => void;
}

export function HomePage({ save, onStartGame, onOpenWallet }: HomePageProps) {
  const nextStage = stages.find((stage) => save.unlockedStages.includes(stage.id)) ?? stages[0];
  const recentLog = save.memoryLogs[0];

  return (
    <section className="page-stack home-page">
      <div className="hero-panel">
        <SectionHeader
          eyebrow="오늘의 한마디"
          title="오늘도 너한테 제일 다정한 게임"
          description="하임팡은 작은 보상과 추억을 모으는 개인용 매치3 선물 앱이에요."
        />
        <div className="hero-actions">
          <button type="button" className="primary-button" onClick={onStartGame}>
            게임 시작
          </button>
          <button type="button" className="secondary-button" onClick={onOpenWallet}>
            쿠폰 보기
          </button>
        </div>
      </div>

      <div className="reward-strip">
        <div>
          <p className="eyebrow">오늘의 작은 보상</p>
          <strong>하트 1개와 별 3개</strong>
        </div>
        <span className="soft-badge">준비됨</span>
      </div>

      <div className="two-column">
        <article className="info-card">
          <p className="eyebrow">다음 스테이지</p>
          <h3>{nextStage.title}</h3>
          <p>이동 {nextStage.moveLimit}회 안에 {nextStage.missions[0].label} 달성.</p>
        </article>
        <article className="info-card">
          <p className="eyebrow">최근 기록</p>
          <h3>{recentLog.title}</h3>
          <p>{recentLog.description}</p>
        </article>
      </div>
    </section>
  );
}
