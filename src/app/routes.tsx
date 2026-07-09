export type AppRouteKey = 'home' | 'game' | 'wallet' | 'memory' | 'settings';

export interface AppRoute {
  key: AppRouteKey;
  label: string;
  shortLabel: string;
}

export const routes: AppRoute[] = [
  { key: 'home', label: '홈', shortLabel: '홈' },
  { key: 'game', label: '게임', shortLabel: '게임' },
  { key: 'wallet', label: '지갑', shortLabel: '지갑' },
  { key: 'memory', label: '추억', shortLabel: '추억' },
  { key: 'settings', label: '설정', shortLabel: '설정' },
];
