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
  stageId?: number;
  stageStatus?: string;
  movesRemaining?: number;
  missionProgress?: string;
  specialTileCount?: number;
  createdSpecialCount?: number;
  activatedSpecialCount?: number;
  lastSpecialCreated?: string;
  lastSpecialActivated?: string;
  lastSpecialAffectedCount?: number;
  firstClear?: string;
  rewardPending?: boolean;
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
          <span>stage: {metrics.session.stageId ?? 'n/a'}</span>
          <span>stage-status: {metrics.session.stageStatus ?? 'n/a'}</span>
          <span>moves-left: {metrics.session.movesRemaining ?? 'n/a'}</span>
          <span>missions: {metrics.session.missionProgress ?? 'n/a'}</span>
          <span>specials-board: {metrics.session.specialTileCount ?? 0}</span>
          <span>specials-created: {metrics.session.createdSpecialCount ?? 0}</span>
          <span>specials-activated: {metrics.session.activatedSpecialCount ?? 0}</span>
          <span>last-created: {metrics.session.lastSpecialCreated ?? 'none'}</span>
          <span>last-activated: {metrics.session.lastSpecialActivated ?? 'none'}</span>
          <span>last-affected: {metrics.session.lastSpecialAffectedCount ?? 0}</span>
          <span>first-clear: {metrics.session.firstClear ?? 'n/a'}</span>
          <span>reward-pending: {String(metrics.session.rewardPending ?? false)}</span>
          <span>unlocked: {save.unlockedStages.join(',')}</span>
          <span>cleared: {save.clearedStages.join(',')}</span>
          <span>seed: {metrics.session.seed}</span>
        </>
      )}
    </aside>
  );
}
