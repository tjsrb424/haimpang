import type { AppRouteKey } from '../app/routes';

export interface AppUiState {
  activeRoute: AppRouteKey;
  isPortraitOptimized: boolean;
}

export const createInitialAppUiState = (): AppUiState => ({
  activeRoute: 'home',
  isPortraitOptimized: true,
});
