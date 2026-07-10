import type { StageDefinition, StageMission } from '../data/stages';
import type { MissionProgress, StageProgressSummary } from '../game/session/stageSession';
import { getMissionDisplayLabel } from '../game/presentation/missionPresentation';
import { formatStageNumber } from '../game/presentation/stagePresentation';
import { getTilePresentation } from '../game/presentation/tilePresentation';

interface GameHudProps {
  stage: StageDefinition;
  summary: StageProgressSummary;
  menuOpen: boolean;
  onBack: () => void;
  onToggleMenu: () => void;
}

function missionIcon(mission: StageMission) {
  if (mission.type === 'collect_tile') {
    const presentation = getTilePresentation(mission.tileKind);
    return <img src={presentation.assetPath} alt="" aria-hidden="true" />;
  }

  const className =
    mission.type === 'score'
      ? 'score'
      : mission.type === 'clear_tiles'
        ? 'pop'
        : mission.type === 'cascade'
          ? 'combo'
          : 'special';
  return <span className={`mission-symbol ${className}`} aria-hidden="true" />;
}

function MissionRow({ mission, progress }: { mission: StageMission; progress: MissionProgress }) {
  const ratio = Math.min(100, Math.round((progress.current / progress.required) * 100));

  return (
    <div className={progress.completed ? 'game-mission-row complete' : 'game-mission-row'}>
      <span className="game-mission-icon">{missionIcon(mission)}</span>
      <span className="game-mission-copy">
        <span>{getMissionDisplayLabel(mission)}</span>
        <span className="game-mission-bar" aria-hidden="true">
          <span style={{ width: `${ratio}%` }} />
        </span>
      </span>
      <strong>
        {progress.current} / {progress.required}
      </strong>
    </div>
  );
}

export function GameHud({ stage, summary, menuOpen, onBack, onToggleMenu }: GameHudProps) {
  const lowMoves = summary.movesRemaining <= 5;

  return (
    <header className="game-hud">
      <div className="game-hud-topline">
        <button
          type="button"
          className="hud-icon-button back"
          onClick={onBack}
          aria-label="스테이지 선택으로 돌아가기"
        >
          <span aria-hidden="true" />
        </button>
        <strong>{formatStageNumber(stage.id)}</strong>
        <button
          type="button"
          className={menuOpen ? 'hud-icon-button menu active' : 'hud-icon-button menu'}
          onClick={onToggleMenu}
          aria-label="게임 메뉴"
          aria-expanded={menuOpen}
        >
          <span aria-hidden="true" />
        </button>
      </div>

      <div className="game-hud-stats">
        <div className={lowMoves ? 'move-tag low' : 'move-tag'}>
          <span>남은 이동</span>
          <strong>{summary.movesRemaining}</strong>
        </div>
        <div className="score-tag">
          <span className="score-star" aria-hidden="true" />
          <span>점수</span>
          <strong>{summary.score.toLocaleString('ko-KR')}</strong>
        </div>
      </div>

      <div className="game-missions" aria-label="스테이지 미션">
        {summary.missionProgress.map((progress) => (
          <MissionRow
            key={progress.missionIndex}
            mission={stage.missions[progress.missionIndex]}
            progress={progress}
          />
        ))}
      </div>
    </header>
  );
}
