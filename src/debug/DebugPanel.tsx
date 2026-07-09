import { useEffect, useState } from 'react';
import type { AppRouteKey } from '../app/routes';
import type { HaimpangSave } from '../save/saveManager';
import { SAVE_VERSION } from '../save/saveManager';

interface DebugPanelProps {
  activeRoute: AppRouteKey;
  save: HaimpangSave;
}

interface HaimpangDebugSnapshot {
  inputState: string;
  selectedTile: string;
  pointerDownTile: string;
  lastSwipeDirection: string;
  boardSize: number;
  tileSize: number;
  score: number;
  moveCount: number;
  cascadeCount: number;
  seed: string;
  inputLocked: boolean;
}

interface DebugMetrics {
  viewport: string;
  dpr: string;
  safeArea: string;
  canvas: string;
  session: HaimpangDebugSnapshot | null;
}

type DebugWindow = Window & {
  __haimpangDebug?: HaimpangDebugSnapshot;
};

const readMetrics = (): DebugMetrics => {
  if (typeof window === 'undefined') {
    return {
      viewport: 'ssr',
      dpr: 'n/a',
      safeArea: 'n/a',
      canvas: 'n/a',
      session: null,
    };
  }

  const canvas = document.querySelector('.game-host canvas');
  const canvasSize = canvas
    ? `${Math.round(canvas.clientWidth)}x${Math.round(canvas.clientHeight)}`
    : 'none';

  return {
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    dpr: window.devicePixelRatio.toFixed(2),
    safeArea: window.CSS?.supports?.('padding-bottom: env(safe-area-inset-bottom)') ? 'supported' : 'unknown',
    canvas: canvasSize,
    session: (window as DebugWindow).__haimpangDebug ?? null,
  };
};

export function DebugPanel({ activeRoute, save }: DebugPanelProps) {
  const [metrics, setMetrics] = useState<DebugMetrics>(() => readMetrics());

  useEffect(() => {
    const update = () => setMetrics(readMetrics());
    update();
    window.addEventListener('resize', update);
    const intervalId = window.setInterval(update, 300);

    return () => {
      window.removeEventListener('resize', update);
      window.clearInterval(intervalId);
    };
  }, [activeRoute]);

  return (
    <aside className="debug-panel" aria-label="Debug panel">
      <strong>Debug</strong>
      <span>route: {activeRoute}</span>
      <span>viewport: {metrics.viewport}</span>
      <span>dpr: {metrics.dpr}</span>
      <span>safe-area: {metrics.safeArea}</span>
      <span>canvas: {metrics.canvas}</span>
      <span>save: v{SAVE_VERSION}</span>
      <span>stars: {save.stars}</span>
      {metrics.session && (
        <>
          <span>input: {metrics.session.inputState}</span>
          <span>locked: {String(metrics.session.inputLocked)}</span>
          <span>selected: {metrics.session.selectedTile}</span>
          <span>down: {metrics.session.pointerDownTile}</span>
          <span>swipe: {metrics.session.lastSwipeDirection}</span>
          <span>board: {metrics.session.boardSize}px</span>
          <span>tile: {metrics.session.tileSize}px</span>
          <span>score: {metrics.session.score}</span>
          <span>moves: {metrics.session.moveCount}</span>
          <span>cascade: {metrics.session.cascadeCount}</span>
          <span>seed: {metrics.session.seed}</span>
        </>
      )}
    </aside>
  );
}
