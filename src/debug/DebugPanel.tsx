import { useEffect, useState } from 'react';
import type { AppRouteKey } from '../app/routes';
import type { HaimpangSave } from '../save/saveManager';
import { SAVE_VERSION } from '../save/saveManager';

interface DebugPanelProps {
  activeRoute: AppRouteKey;
  save: HaimpangSave;
}

interface DebugMetrics {
  viewport: string;
  dpr: string;
  safeArea: string;
  canvas: string;
}

const readMetrics = (): DebugMetrics => {
  if (typeof window === 'undefined') {
    return {
      viewport: 'ssr',
      dpr: 'n/a',
      safeArea: 'n/a',
      canvas: 'n/a',
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
  };
};

export function DebugPanel({ activeRoute, save }: DebugPanelProps) {
  const [metrics, setMetrics] = useState<DebugMetrics>(() => readMetrics());

  useEffect(() => {
    const update = () => setMetrics(readMetrics());
    update();
    window.addEventListener('resize', update);
    const intervalId = window.setInterval(update, 1000);

    return () => {
      window.removeEventListener('resize', update);
      window.clearInterval(intervalId);
    };
  }, [activeRoute]);

  return (
    <aside className="debug-panel" aria-label="개발자 디버그 패널">
      <strong>Debug</strong>
      <span>route: {activeRoute}</span>
      <span>viewport: {metrics.viewport}</span>
      <span>dpr: {metrics.dpr}</span>
      <span>safe-area: {metrics.safeArea}</span>
      <span>canvas: {metrics.canvas}</span>
      <span>save: v{SAVE_VERSION}</span>
      <span>stars: {save.stars}</span>
    </aside>
  );
}
