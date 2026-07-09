import { useEffect, useRef } from 'react';
import { createGame } from './phaser/createGame';
import type { GameSessionSummary } from './phaser/session/GameSession';

interface GameHostProps {
  onSessionChange?: (summary: GameSessionSummary) => void;
  vibrationEnabled?: boolean;
}

export function GameHost({ onSessionChange, vibrationEnabled = true }: GameHostProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current) {
      return undefined;
    }

    const game = createGame(hostRef.current, {
      onSessionChange,
      vibrationEnabled,
    });

    return () => {
      game.destroy(true);
    };
  }, [onSessionChange, vibrationEnabled]);

  return <div ref={hostRef} className="game-host" aria-label="HAIMPANG match-3 board" />;
}
