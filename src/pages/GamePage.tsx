import { useCallback, useState } from 'react';
import { stages } from '../data/stages';
import { GameHost } from '../game/GameHost';
import type { GameSessionSummary } from '../game/phaser/session/GameSession';

const initialSummary: GameSessionSummary = {
  score: 0,
  moveCount: 0,
  inputState: 'READY',
  cascadeCount: 0,
};

export function GamePage() {
  const stage = stages[0];
  const [summary, setSummary] = useState<GameSessionSummary>(initialSummary);
  const handleSessionChange = useCallback((nextSummary: GameSessionSummary) => {
    setSummary(nextSummary);
  }, []);

  return (
    <section className="page-stack game-page">
      <div className="mission-card">
        <div>
          <p className="eyebrow">Stage {stage.id}</p>
          <h2>{stage.title}</h2>
          <p className="mini-note">{stage.missions[0].label} target is ready.</p>
        </div>
        <div className="mission-stats">
          <span className="stage-badge">Move {summary.moveCount}/{stage.moveLimit}</span>
          <span className="stage-badge">Score {summary.score}</span>
        </div>
      </div>

      <div className="mission-goal">
        <span className="mini-note">Today goal</span>
        <strong>{stage.missions[0].label}</strong>
      </div>

      <div className="board-shell">
        <div className="board-label">
          <span>8 x 8 live board</span>
          <span>{summary.inputState}</span>
        </div>
        <GameHost onSessionChange={handleSessionChange} />
      </div>

      <div className="booster-row" aria-label="Boosters">
        <button type="button">Hint</button>
        <button type="button">Shuffle</button>
        <button type="button">Pause</button>
      </div>
    </section>
  );
}
