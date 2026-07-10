import { useMemo, useState } from 'react';
import { routes, type AppRouteKey } from './app/routes';
import { AppFrame } from './components/AppFrame';
import { stages } from './data/stages';
import { DebugPanel } from './debug/DebugPanel';
import type { StageFinishResult } from './game/session/stageSession';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { StageSelectPage } from './pages/StageSelectPage';
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
  useCoupon as applyCouponUse,
  type HaimpangSave,
} from './save/saveManager';
import { canStartStage, getRecommendedStage } from './stage/stageSelect';

type GameView = 'select' | 'play';

export function App() {
  const [activeRoute, setActiveRoute] = useState<AppRouteKey>('home');
  const [save, setSave] = useState<HaimpangSave>(() => loadSave());
  const [currentStageId, setCurrentStageId] = useState(1);
  const [gameView, setGameView] = useState<GameView>('select');
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
    return getRecommendedStage(stages, nextSave).id;
  };

  const startGame = () => {
    setCurrentStageId(getNextPlayableStageId(save));
    setStageResult(null);
    setGameView('play');
    setGameRunId((value) => value + 1);
    setActiveRoute('game');
  };

  const startStage = (stageId: number) => {
    if (!canStartStage(save, stageId)) {
      return;
    }

    setCurrentStageId(stageId);
    setStageResult(null);
    setGameView('play');
    setGameRunId((value) => value + 1);
    setActiveRoute('game');
  };

  const openStageSelect = () => {
    setStageResult(null);
    setGameView('select');
    setActiveRoute('game');
  };

  const openWallet = () => {
    setStageResult(null);
    setActiveRoute('wallet');
  };

  const handleRouteChange = (route: AppRouteKey) => {
    setStageResult(null);
    if (route === 'game') {
      setGameView('select');
    }
    setActiveRoute(route);
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
    setGameView('play');
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
    setGameView('play');
    setGameRunId((value) => value + 1);
  };

  const goHome = () => {
    setStageResult(null);
    setActiveRoute('home');
  };

  const handleUseCoupon = (couponId: string) => {
    updateSave(applyCouponUse(save, couponId));
  };

  return (
    <AppFrame
      activeRoute={activeRoute}
      routes={routes}
      save={save}
      todayLabel={todayLabel}
      onRouteChange={handleRouteChange}
    >
      {activeRoute === 'home' && (
        <HomePage
          save={save}
          onStartGame={startGame}
          onOpenStageSelect={openStageSelect}
          onOpenWallet={openWallet}
        />
      )}
      {activeRoute === 'game' && gameView === 'select' && (
        <StageSelectPage save={save} onStartStage={startStage} onHome={goHome} />
      )}
      {activeRoute === 'game' && gameView === 'play' && (
        <GamePage
          stage={currentStage}
          runId={gameRunId}
          result={stageResult}
          vibrationEnabled={save.settings.vibration}
          effectLabEnabled={save.settings.debugPanel}
          onStageFinished={handleStageFinished}
          onReplay={replayStage}
          onNextStage={goNextStage}
          onStageSelect={openStageSelect}
          onOpenWallet={openWallet}
          onHome={goHome}
        />
      )}
      {activeRoute === 'wallet' && <WalletPage save={save} onUseCoupon={handleUseCoupon} />}
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
