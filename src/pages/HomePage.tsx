import { SectionHeader } from '../components/SectionHeader';
import { stages } from '../data/stages';
import type { HaimpangSave } from '../save/saveManager';

interface HomePageProps {
  save: HaimpangSave;
  onStartGame: () => void;
  onOpenWallet: () => void;
}

export function HomePage({ save, onStartGame, onOpenWallet }: HomePageProps) {
  const unlockedStages = stages
    .filter((stage) => save.unlockedStages.includes(stage.id))
    .sort((a, b) => a.id - b.id);
  const nextStage =
    unlockedStages.find((stage) => !save.clearedStages.includes(stage.id)) ??
    unlockedStages[unlockedStages.length - 1] ??
    stages[0];
  const recentLog = save.memoryLogs[0];

  return (
    <section className="page-stack home-page">
      <div className="hero-panel">
        <SectionHeader
          eyebrow="오늘의 메시지"
          title="오늘도 하임팡 열어줘서 고마워"
          description="작은 선물과 스테이지 기록이 차곡차곡 쌓이는 효임 전용 퍼즐 앱이에요."
        />
        <div className="hero-actions">
          <button type="button" className="primary-button" onClick={onStartGame}>
            게임 시작하기
          </button>
          <button type="button" className="secondary-button" onClick={onOpenWallet}>
            쿠폰 지갑
          </button>
        </div>
      </div>

      <div className="home-stats">
        <article className="stat-card">
          <p className="eyebrow">보유 별</p>
          <strong>{save.stars}</strong>
          <p className="mini-note">선물 해금에 쓰는 반짝 포인트</p>
        </article>
        <article className="stat-card">
          <p className="eyebrow">보유 하트</p>
          <strong>{save.hearts}</strong>
          <p className="mini-note">오늘의 플레이 에너지</p>
        </article>
      </div>

      <div className="reward-strip">
        <div>
          <p className="eyebrow">오늘의 작은 선물</p>
          <strong>하트 충전 완료</strong>
          <p className="mini-note">게임 한 판 하기 좋은 상태예요.</p>
        </div>
        <span className="soft-badge">준비됨</span>
      </div>

      <div className="two-column">
        <article className="info-card">
          <p className="eyebrow">다음 스테이지</p>
          <h3>{nextStage.title}</h3>
          <p>
            이동 {nextStage.moveLimit}회 안에 {nextStage.missions[0].label} 달성.
          </p>
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
