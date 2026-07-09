export type AppRouteKey = 'home' | 'game' | 'wallet' | 'memory' | 'settings';

export interface AppRoute {
  key: AppRouteKey;
  label: string;
  shortLabel: string;
}

export const routes: AppRoute[] = [
  { key: 'home', label: 'Home', shortLabel: '홈' },
  { key: 'game', label: 'Game', shortLabel: '게임' },
  { key: 'wallet', label: 'Wallet', shortLabel: '지갑' },
  { key: 'memory', label: 'Memory', shortLabel: '추억' },
  { key: 'settings', label: 'Settings', shortLabel: '설정' },
];
