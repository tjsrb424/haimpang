import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StageDefinition } from '../data/stages';
import { GameHost } from '../game/GameHost';
import {
  createStageSession,
  toStageProgressSummary,
  type StageFinishResult,
  type StageProgressSummary,
} from '../game/session/stageSession';

interface GamePageProps {
  stage: StageDefinition;
  runId: number;
  result: StageFinishResult | null;
  vibrationEnabled: boolean;
  onStageFinished: (result: StageFinishResult) => void;
  onReplay: () => void;
  onNextStage: () => void;
  onStageSelect: () => void;
  onOpenWallet: () => void;
  onHome: () => void;
}

function createInitialProgress(stage: StageDefinition): StageProgressSummary {
  return toStageProgressSummary(createStageSession(stage), 'READY');
}

export function GamePage({
  stage,
  runId,
  result,
  vibrationEnabled,
  onStageFinished,
  onReplay,
  onNextStage,
  onStageSelect,
  onOpenWallet,
  onHome,
}: GamePageProps) {
  const [summary, setSummary] = useState<StageProgressSummary>(() => createInitialProgress(stage));

  useEffect(() => {
    setSummary(createInitialProgress(stage));
  }, [stage, runId]);

  const handleStageProgress = useCallback((nextSummary: StageProgressSummary) => {
    setSummary(nextSummary);
  }, []);

  const missionTitle = useMemo(
    () =>
      summary.missionProgress
        .map((mission) => `${mission.label} ${mission.current}/${mission.required}`)
        .join(' / '),
    [summary.missionProgress],
  );

  return (
    <section className="page-stack game-page">
      <div className="mission-card">
        <div>
          <p className="eyebrow">Stage {stage.id}</p>
          <h2>{stage.title}</h2>
          <p className="mini-note">{stage.subtitle ?? missionTitle}</p>
        </div>
        <div className="mission-stats">
          <span className="stage-badge">Moves {summary.movesRemaining}</span>
          <span className="stage-badge">Score {summary.score}</span>
        </div>
      </div>

      <div className="mission-goal mission-list">
        {summary.missionProgress.map((mission) => (
          <div className={mission.completed ? 'mission-progress complete' : 'mission-progress'} key={mission.missionIndex}>
            <span>{mission.completed ? 'OK' : '-'} {mission.label}</span>
            <strong>{mission.current}/{mission.required}</strong>
          </div>
        ))}
      </div>

      <div className="board-shell">
        <div className="board-label">
          <span>8 x 8 stage board</span>
          <span>{summary.status === 'playing' ? summary.inputState : summary.status.toUpperCase()}</span>
        </div>
        <GameHost
          key={`${stage.id}:${runId}`}
          stage={stage}
          onStageProgress={handleStageProgress}
          onStageFinished={onStageFinished}
          vibrationEnabled={vibrationEnabled}
        />
      </div>

      <div className="booster-row" aria-label="Stage actions">
        <button type="button">Hint</button>
        <button type="button">Shuffle</button>
        <button type="button" onClick={onReplay}>Replay</button>
      </div>

      {result && (
        <div className="result-overlay" role="dialog" aria-modal="true" aria-label="Stage result">
          <article className={result.status === 'won' ? 'result-card won' : 'result-card lost'}>
            <p className="eyebrow">Stage {stage.id}</p>
            <h2>{result.status === 'won' ? 'Clear!' : 'Try again soon'}</h2>
            <p className="mini-note">
              {result.status === 'won'
                ? 'A little gift opened and your reward was saved.'
                : 'A soft miss. One more try can open this gift.'}
            </p>

            <div className="result-summary">
              <span>Score <strong>{result.score}</strong></span>
              <span>Moves used <strong>{result.movesUsed}</strong></span>
              {result.reward && <span>Stars <strong>+{result.reward.stars}</strong></span>}
              {result.reward?.hearts && <span>Hearts <strong>+{result.reward.hearts}</strong></span>}
              {result.reward?.couponId && <span>Coupon <strong>{result.reward.couponId}</strong></span>}
              {result.status === 'won' && !result.firstClear && <span>Reward claimed on first clear</span>}
            </div>

            <div className="result-actions">
              <button type="button" className="primary-button" onClick={result.status === 'won' ? onNextStage : onReplay}>
                {result.status === 'won' ? 'Next stage' : 'Retry'}
              </button>
              {result.status === 'won' && result.reward?.couponId && (
                <button type="button" className="secondary-button" onClick={onOpenWallet}>
                  Coupon wallet
                </button>
              )}
              <button type="button" className="secondary-button" onClick={onStageSelect}>
                Stage select
              </button>
              <button type="button" className="secondary-button" onClick={onReplay}>
                Replay
              </button>
              <button type="button" className="secondary-button" onClick={onHome}>
                Home
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
