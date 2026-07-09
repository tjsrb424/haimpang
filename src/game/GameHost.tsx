import { useEffect, useRef } from 'react';
import { createGame } from './phaser/createGame';

export function GameHost() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current) {
      return undefined;
    }

    const game = createGame(hostRef.current);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={hostRef} className="game-host" aria-label="HAIMPANG match-3 board" />;
}
