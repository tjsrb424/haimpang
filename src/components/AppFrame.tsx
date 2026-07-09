import type { ReactNode } from 'react';
import type { AppRoute, AppRouteKey } from '../app/routes';
import type { HaimpangSave } from '../save/saveManager';

interface AppFrameProps {
  activeRoute: AppRouteKey;
  routes: AppRoute[];
  save: HaimpangSave;
  todayLabel: string;
  children: ReactNode;
  onRouteChange: (route: AppRouteKey) => void;
}

export function AppFrame({
  activeRoute,
  routes,
  save,
  todayLabel,
  children,
  onRouteChange,
}: AppFrameProps) {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-lockup" aria-label="HAIMPANG">
          <img src="/assets/icons/icon-192.png" alt="" className="brand-mark" />
          <div>
            <p className="eyebrow">효임을 위한 선물 앱</p>
            <h1>HAIMPANG</h1>
          </div>
        </div>

        <div className="status-row" aria-label="보유 재화">
          <span className="status-pill">별 {save.stars}</span>
          <span className="status-pill">하트 {save.hearts}</span>
          <span className="date-pill">{todayLabel}</span>
        </div>
      </header>

      <main className="screen-surface">{children}</main>

      <nav className="bottom-tabs" aria-label="하단 메뉴">
        {routes.map((route) => (
          <button
            type="button"
            key={route.key}
            className={route.key === activeRoute ? 'tab-button active' : 'tab-button'}
            onClick={() => onRouteChange(route.key)}
            aria-current={route.key === activeRoute ? 'page' : undefined}
          >
            <span className="tab-dot" aria-hidden="true" />
            <span>{route.shortLabel}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
