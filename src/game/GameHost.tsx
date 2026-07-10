import { useEffect, useRef } from 'react';
import type { StageDefinition } from '../data/stages';
import type { StageFinishResult, StageProgressSummary } from './session/stageSession';
import { createGame } from './phaser/createGame';
import type { GameSessionSummary } from './phaser/session/GameSession';

interface GameHostProps {
  stage: StageDefinition;
  onSessionChange?: (summary: GameSessionSummary) => void;
  onStageProgress?: (summary: StageProgressSummary) => void;
  onStageFinished?: (result: StageFinishResult) => void;
  vibrationEnabled?: boolean;
  effectLabEnabled?: boolean;
}

export function GameHost({
  stage,
  onSessionChange,
  onStageProgress,
  onStageFinished,
  vibrationEnabled = true,
  effectLabEnabled = false,
}: GameHostProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const callbacksRef = useRef({
    onSessionChange,
    onStageProgress,
    onStageFinished,
  });

  useEffect(() => {
    callbacksRef.current = {
      onSessionChange,
      onStageProgress,
      onStageFinished,
    };
  }, [onSessionChange, onStageFinished, onStageProgress]);

  useEffect(() => {
    if (!hostRef.current) {
      return undefined;
    }

    const game = createGame(hostRef.current, {
      stage,
      onSessionChange: (summary) => callbacksRef.current.onSessionChange?.(summary),
      onStageProgress: (summary) => callbacksRef.current.onStageProgress?.(summary),
      onStageFinished: (result) => callbacksRef.current.onStageFinished?.(result),
      vibrationEnabled,
      effectLabEnabled,
    });

    return () => {
      game.destroy(true);
    };
  }, [effectLabEnabled, stage, vibrationEnabled]);

  return <div ref={hostRef} className="game-host" aria-label="HAIMPANG match-3 board" />;
}
