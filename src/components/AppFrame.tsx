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
        <div className="brand-row">
          <div className="brand-lockup" aria-label="HAIMPANG">
            <span className="brand-sigil" aria-hidden="true">
              HP
            </span>
            <div>
              <p className="eyebrow">효임을 위한 선물 앱</p>
              <h1>HAIMPANG</h1>
            </div>
          </div>
          <span className="today-chip">{todayLabel}</span>
        </div>

        <div className="status-row" aria-label="보유 재화">
          <span className="status-pill star">별 {save.stars}</span>
          <span className="status-pill heart">하트 {save.hearts}</span>
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
            <span className={`tab-glyph ${route.key}`} aria-hidden="true" />
            <span>{route.shortLabel}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
