import { useCallback, useEffect, useState } from 'react';
import { GameHud } from '../components/GameHud';
import { ResultOverlay } from '../components/ResultOverlay';
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
  effectLabEnabled: boolean;
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
  effectLabEnabled,
  onStageFinished,
  onReplay,
  onNextStage,
  onStageSelect,
  onOpenWallet,
  onHome,
}: GamePageProps) {
  const [summary, setSummary] = useState<StageProgressSummary>(() => createInitialProgress(stage));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSummary(createInitialProgress(stage));
    setMenuOpen(false);
  }, [stage, runId]);

  const handleStageProgress = useCallback((nextSummary: StageProgressSummary) => {
    setSummary(nextSummary);
  }, []);

  return (
    <section className="game-page berry-game-page">
      <GameHud
        stage={stage}
        summary={summary}
        menuOpen={menuOpen}
        onBack={onStageSelect}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />

      {menuOpen && (
        <div className="game-menu-popover" role="menu" aria-label="게임 메뉴">
          <button type="button" role="menuitem" onClick={onStageSelect}>
            스테이지 선택
          </button>
          <button type="button" role="menuitem" onClick={onHome}>
            홈으로
          </button>
        </div>
      )}

      <div className="board-shell berry-board-shell">
        <GameHost
          key={`${stage.id}:${runId}`}
          stage={stage}
          onStageProgress={handleStageProgress}
          onStageFinished={onStageFinished}
          vibrationEnabled={vibrationEnabled}
          effectLabEnabled={effectLabEnabled}
        />
      </div>

      <div className="game-actions" aria-label="스테이지 메뉴">
        <button type="button" className="secondary-button" onClick={onReplay}>
          다시 시작
        </button>
      </div>

      {result && (
        <ResultOverlay
          stage={stage}
          result={result}
          highestCombo={summary.cascadeMax}
          onReplay={onReplay}
          onNextStage={onNextStage}
          onStageSelect={onStageSelect}
          onOpenWallet={onOpenWallet}
          onHome={onHome}
        />
      )}
    </section>
  );
}
