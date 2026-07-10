import { useEffect, useRef, useState } from 'react';
import type { AppRouteKey } from '../app/routes';
import type { HaimpangSave } from '../save/saveManager';
import { SAVE_VERSION } from '../save/saveManager';
import { requestEffectLabCue, type EffectLabCue } from '../game/phaser/debug/effectLab';
import { DesignLab } from '../components/DesignLab';

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
  lastComboCount?: number;
  lastComboEffect?: string;
  firstClear?: string;
  rewardPending?: boolean;
  possibleMoves?: Array<{
    from: { row: number; col: number };
    to: { row: number; col: number };
  }>;
  boardKinds?: string[][];
  displayObjectCount?: number;
  activeTweenCount?: number;
  averageFps?: number;
  effectObjectCount?: number;
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
    safeArea: window.CSS?.supports?.('padding-bottom: env(safe-area-inset-bottom)')
      ? 'supported'
      : 'unknown',
    canvas: canvasSize,
    session: (window as DebugWindow).__haimpangDebug ?? null,
  };
};

export function DebugPanel({ activeRoute, save }: DebugPanelProps) {
  const [metrics, setMetrics] = useState<DebugMetrics>(() => readMetrics());
  const [lastCue, setLastCue] = useState('none');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [designLabOpen, setDesignLabOpen] = useState(false);
  const previewTimerRef = useRef<number | null>(null);

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

  useEffect(
    () => () => {
      if (previewTimerRef.current !== null) {
        window.clearTimeout(previewTimerRef.current);
      }
    },
    [],
  );

  const playCue = (cue: EffectLabCue) => {
    if (requestEffectLabCue(cue)) {
      setLastCue(cue);
      setIsPreviewing(true);
      if (previewTimerRef.current !== null) {
        window.clearTimeout(previewTimerRef.current);
      }
      previewTimerRef.current = window.setTimeout(() => {
        setIsPreviewing(false);
        previewTimerRef.current = null;
      }, 1800);
    }
  };

  const effectLabReady = activeRoute === 'game' && metrics.session !== null;
  const nextMove = metrics.session?.possibleMoves?.[0];
  const stageFinished =
    metrics.session?.stageStatus !== undefined && metrics.session.stageStatus !== 'playing';
  const panelClassName = [
    'debug-panel',
    isPreviewing ? 'previewing' : '',
    stageFinished ? 'stage-finished' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={panelClassName} aria-label="Debug panel">
      <strong>Debug</strong>
      {import.meta.env.DEV && (
        <button
          type="button"
          className="debug-design-lab-button"
          onClick={() => setDesignLabOpen(true)}
        >
          디자인 랩 열기
        </button>
      )}
      <div className="debug-effect-lab" role="group" aria-label="Combo effect QA harness">
        <strong>Effect Lab</strong>
        <button type="button" disabled={!effectLabReady} onClick={() => playCue('combo-2')}>
          2콤보 재생
        </button>
        <button type="button" disabled={!effectLabReady} onClick={() => playCue('combo-5')}>
          5콤보 재생
        </button>
        <button type="button" disabled={!effectLabReady} onClick={() => playCue('combo-8')}>
          8콤보 재생
        </button>
        <button
          type="button"
          disabled={!effectLabReady}
          onClick={() => playCue('combo-10-haimpang')}
        >
          10콤보 하임팡 재생
        </button>
        <button type="button" disabled={!effectLabReady} onClick={() => playCue('normal-pop')}>
          일반 베리 팝
        </button>
        <button type="button" disabled={!effectLabReady} onClick={() => playCue('special-pop')}>
          특수 베리 팝
        </button>
        <span aria-live="polite">last-cue: {lastCue}</span>
      </div>
      <details className="debug-metrics">
        <summary>Metrics</summary>
        <div>
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
              <span>last-combo: {metrics.session.lastComboCount ?? 0}</span>
              <span>combo-effect: {metrics.session.lastComboEffect ?? 'none'}</span>
              <span>objects: {metrics.session.displayObjectCount ?? 0}</span>
              <span>tweens: {metrics.session.activeTweenCount ?? 0}</span>
              <span>fps: {metrics.session.averageFps ?? 0}</span>
              <span>effect-objects: {metrics.session.effectObjectCount ?? 0}</span>
              <span>first-clear: {metrics.session.firstClear ?? 'n/a'}</span>
              <span>reward-pending: {String(metrics.session.rewardPending ?? false)}</span>
              <span>
                next-move:{' '}
                {nextMove
                  ? `${nextMove.from.row},${nextMove.from.col}>${nextMove.to.row},${nextMove.to.col}`
                  : 'none'}
              </span>
              <span className="debug-possible-moves">
                possible-moves: {JSON.stringify(metrics.session.possibleMoves ?? [])}
              </span>
              <span className="debug-board-kinds">
                board-kinds: {JSON.stringify(metrics.session.boardKinds ?? [])}
              </span>
              <span>unlocked: {save.unlockedStages.join(',')}</span>
              <span>cleared: {save.clearedStages.join(',')}</span>
              <span>seed: {metrics.session.seed}</span>
            </>
          )}
        </div>
      </details>
      {import.meta.env.DEV && (
        <DesignLab
          open={designLabOpen}
          effectLabReady={effectLabReady}
          onClose={() => setDesignLabOpen(false)}
          onPlayCue={(cue) => {
            playCue(cue);
            setDesignLabOpen(false);
          }}
        />
      )}
    </aside>
  );
}
