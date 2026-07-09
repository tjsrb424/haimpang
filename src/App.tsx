import { useMemo, useState } from 'react';
import { routes, type AppRouteKey } from './app/routes';
import { AppFrame } from './components/AppFrame';
import { DebugPanel } from './debug/DebugPanel';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { WalletPage } from './pages/WalletPage';
import { MemoryPage } from './pages/MemoryPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  exportSave,
  importSave,
  loadSave,
  resetSave,
  saveGame,
  type HaimpangSave,
} from './save/saveManager';

export function App() {
  const [activeRoute, setActiveRoute] = useState<AppRouteKey>('home');
  const [save, setSave] = useState<HaimpangSave>(() => loadSave());

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }).format(new Date()),
    [],
  );

  const updateSave = (nextSave: HaimpangSave) => {
    setSave(nextSave);
    saveGame(nextSave);
  };

  const handleResetSave = () => {
    const freshSave = resetSave();
    setSave(freshSave);
  };

  const handleImportSave = (payload: string) => {
    const imported = importSave(payload);
    updateSave(imported);
  };

  const toggleSetting = (key: keyof HaimpangSave['settings']) => {
    updateSave({
      ...save,
      settings: {
        ...save.settings,
        [key]: !save.settings[key],
      },
      lastPlayedAt: new Date().toISOString(),
    });
  };

  return (
    <AppFrame
      activeRoute={activeRoute}
      routes={routes}
      save={save}
      todayLabel={todayLabel}
      onRouteChange={setActiveRoute}
    >
      {activeRoute === 'home' && (
        <HomePage
          save={save}
          onStartGame={() => setActiveRoute('game')}
          onOpenWallet={() => setActiveRoute('wallet')}
        />
      )}
      {activeRoute === 'game' && <GamePage />}
      {activeRoute === 'wallet' && <WalletPage save={save} />}
      {activeRoute === 'memory' && <MemoryPage save={save} />}
      {activeRoute === 'settings' && (
        <SettingsPage
          save={save}
          exportedSave={exportSave(save)}
          onImportSave={handleImportSave}
          onResetSave={handleResetSave}
          onToggleSetting={toggleSetting}
        />
      )}
      {save.settings.debugPanel && <DebugPanel activeRoute={activeRoute} save={save} />}
    </AppFrame>
  );
}
