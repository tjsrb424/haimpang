import type { AppRouteKey } from '../app/routes';
import type { HaimpangSave } from '../save/saveManager';

interface DebugPanelProps {
  activeRoute: AppRouteKey;
  save: HaimpangSave;
}

export function DebugPanel({ activeRoute, save }: DebugPanelProps) {
  return (
    <aside className="debug-panel" aria-label="개발자 디버그 패널">
      <strong>Debug</strong>
      <span>route: {activeRoute}</span>
      <span>state: SPRINT_0_SHELL</span>
      <span>input: READY_PLACEHOLDER</span>
      <span>seed: pending</span>
      <span>stars: {save.stars}</span>
    </aside>
  );
}
