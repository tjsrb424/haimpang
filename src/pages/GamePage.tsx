import { stages } from '../data/stages';
import { GameHost } from '../game/GameHost';

export function GamePage() {
  const stage = stages[0];

  return (
    <section className="page-stack game-page">
      <div className="mission-card">
        <div>
          <p className="eyebrow">Stage {stage.id}</p>
          <h2>{stage.title}</h2>
          <p className="mini-note">{stage.missions[0].label}을 목표로 준비 중이에요.</p>
        </div>
        <div className="mission-stats">
          <span className="stage-badge">이동 {stage.moveLimit}</span>
          <span className="stage-badge">점수 0</span>
        </div>
      </div>

      <div className="mission-goal">
        <span className="mini-note">오늘의 목표</span>
        <strong>{stage.missions[0].label}</strong>
      </div>

      <div className="board-shell">
        <div className="board-label">
          <span>8 x 8 preview board</span>
          <span>icon-free</span>
        </div>
        <GameHost />
      </div>

      <div className="booster-row" aria-label="부스터">
        <button type="button">힌트</button>
        <button type="button">섞기</button>
        <button type="button">일시정지</button>
      </div>
    </section>
  );
}
