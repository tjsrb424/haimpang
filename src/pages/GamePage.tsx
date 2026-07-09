import { GameHost } from '../game/GameHost';
import { stages } from '../data/stages';

export function GamePage() {
  const stage = stages[0];

  return (
    <section className="page-stack game-page">
      <div className="mission-bar">
        <div>
          <p className="eyebrow">Stage {stage.id}</p>
          <h2>{stage.title}</h2>
        </div>
        <div className="mission-stats">
          <span>이동 {stage.moveLimit}</span>
          <span>점수 0</span>
        </div>
      </div>

      <GameHost />

      <div className="booster-row" aria-label="부스터">
        <button type="button">힌트</button>
        <button type="button">섞기</button>
        <button type="button">일시정지</button>
      </div>
    </section>
  );
}
