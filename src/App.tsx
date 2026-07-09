import { useMemo, useState } from 'react';
import { routes, type AppRouteKey } from './app/routes';
import { AppFrame } from './components/AppFrame';
import { stages } from './data/stages';
import { DebugPanel } from './debug/DebugPanel';
import type { StageFinishResult } from './game/session/stageSession';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { WalletPage } from './pages/WalletPage';
import { MemoryPage } from './pages/MemoryPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  exportSave,
  importSave,
  applyStageClearReward,
  isStageCleared,
  isStageUnlocked,
  loadSave,
  resetSave,
  saveGame,
  type HaimpangSave,
} from './save/saveManager';

export function App() {
  const [activeRoute, setActiveRoute] = useState<AppRouteKey>('home');
  const [save, setSave] = useState<HaimpangSave>(() => loadSave());
  const [currentStageId, setCurrentStageId] = useState(1);
  const [gameRunId, setGameRunId] = useState(0);
  const [stageResult, setStageResult] = useState<StageFinishResult | null>(null);
  const currentStage = stages.find((stage) => stage.id === currentStageId) ?? stages[0];

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

  const getNextPlayableStageId = (nextSave: HaimpangSave): number => {
    const unlocked = stages
      .filter((stage) => nextSave.unlockedStages.includes(stage.id))
      .sort((a, b) => a.id - b.id);
    const uncleared = unlocked.find((stage) => !nextSave.clearedStages.includes(stage.id));
    return uncleared?.id ?? unlocked[unlocked.length - 1]?.id ?? 1;
  };

  const startGame = () => {
    setCurrentStageId(getNextPlayableStageId(save));
    setStageResult(null);
    setGameRunId((value) => value + 1);
    setActiveRoute('game');
  };

  const handleStageFinished = (result: StageFinishResult) => {
    const finishedStage = stages.find((stage) => stage.id === result.stageId);
    if (!finishedStage) {
      setStageResult(result);
      return;
    }

    if (result.status === 'won') {
      const firstClear = !isStageCleared(save, finishedStage.id);
      const rewardedSave = applyStageClearReward(save, finishedStage);
      updateSave(rewardedSave);
      setStageResult({
        ...result,
        reward: firstClear ? finishedStage.reward : result.reward,
        firstClear,
      });
      return;
    }

    updateSave({
      ...save,
      lastPlayedAt: new Date().toISOString(),
    });
    setStageResult(result);
  };

  const replayStage = () => {
    setStageResult(null);
    setGameRunId((value) => value + 1);
  };

  const goNextStage = () => {
    const nextStage = stages.find((stage) => stage.id === currentStageId + 1);
    if (!nextStage || !isStageUnlocked(save, nextStage.id)) {
      replayStage();
      return;
    }

    setCurrentStageId(nextStage.id);
    setStageResult(null);
    setGameRunId((value) => value + 1);
  };

  const goHome = () => {
    setStageResult(null);
    setActiveRoute('home');
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
          onStartGame={startGame}
          onOpenWallet={() => setActiveRoute('wallet')}
        />
      )}
      {activeRoute === 'game' && (
        <GamePage
          stage={currentStage}
          runId={gameRunId}
          result={stageResult}
          vibrationEnabled={save.settings.vibration}
          onStageFinished={handleStageFinished}
          onReplay={replayStage}
          onNextStage={goNextStage}
          onHome={goHome}
        />
      )}
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
