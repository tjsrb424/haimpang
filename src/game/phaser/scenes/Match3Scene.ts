import Phaser from 'phaser';
import { stages, type StageDefinition } from '../../../data/stages';
import { BOARD_HEIGHT, BOARD_WIDTH, boardToKindRows, isInsideBoard } from '../../core/board';
import { getTile } from '../../core/board';
import { resolveMoveWithSpecials } from '../../core/moveResolution';
import { findPossibleMoves } from '../../core/shuffle';
import { SPECIAL_SCORE_BONUS } from '../../core/special';
import type {
  BoardPosition,
  BoardTile,
  CascadeResult,
  SpecialTileKind,
  TileKind,
} from '../../core/types';
import { canAcceptBoardInput, canStartGesture, type InputState } from '../../input/inputState';
import { pointerToTile, type BoardLayoutMetrics } from '../../input/pointerToTile';
import { detectSwipeDirection, type SwipeDirection } from '../../input/swipeDetector';
import { EFFECT_TIMINGS } from '../../ui/effects';
import {
  invalidSwapRollback,
  moveTileView,
  playSpecialActivationEffects,
  popTileViews,
  swapTileViews,
} from '../animation/boardTweens';
import { playComboEffect, shouldShowHaimpangBurst } from '../animation/comboEffects';
import { playFeedback } from '../animation/effects';
import { playPopBurstEffect } from '../animation/popEffects';
import { EFFECT_LAB_EVENT, getEffectLabCue, type EffectLabCue } from '../debug/effectLab';
import { TileView } from '../objects/TileView';
import { GAME_COLORS } from '../../presentation/designTokens';
import { deriveRefillSpawns, deriveTileMovements, getTileAt } from '../session/boardViewMapper';
import {
  createGameSession,
  scoreRemovedTiles,
  toSessionSummary,
  type GameSession,
  type GameSessionSummary,
} from '../session/GameSession';
import {
  applyMoveResult,
  createStageSession,
  toStageFinishResult,
  toStageProgressSummary,
  type StageFinishResult,
  type StageProgressSummary,
  type StageSession,
} from '../../session/stageSession';

const DEFAULT_STAGE = stages[0];

interface CascadeAnimationResult {
  scoreGained: number;
  removedTiles: Array<{ kind: TileKind }>;
  createdSpecials: Array<{ specialKind: SpecialTileKind }>;
  activatedSpecials: Array<{ specialKind: SpecialTileKind }>;
  cascadeCount: number;
}

interface PointerGesture {
  startX: number;
  startY: number;
  tile: BoardPosition;
  swipeHandled: boolean;
  blockedByAmbiguousSwipe: boolean;
}

export interface Match3SceneOptions {
  stage?: StageDefinition;
  onSessionChange?: (summary: GameSessionSummary) => void;
  onStageProgress?: (summary: StageProgressSummary) => void;
  onStageFinished?: (result: StageFinishResult) => void;
  vibrationEnabled?: boolean;
  effectLabEnabled?: boolean;
}

type DebugWindow = Window & {
  __haimpangDebugOwner?: Match3Scene;
  __haimpangDebug?: {
    inputState: InputState;
    selectedTile: string;
    pointerDownTile: string;
    lastSwipeDirection: string;
    boardSize: number;
    tileSize: number;
    score: number;
    moveCount: number;
    cascadeCount: number;
    seed: string;
    inputLocked: boolean;
    possibleMoves: Array<{ from: BoardPosition; to: BoardPosition }>;
    boardKinds: string[][];
    stageId: number;
    stageStatus: string;
    movesRemaining: number;
    missionProgress: string;
    specialTileCount: number;
    createdSpecialCount: number;
    activatedSpecialCount: number;
    lastSpecialCreated: string;
    lastSpecialActivated: string;
    lastSpecialAffectedCount: number;
    lastComboCount: number;
    lastComboEffect: string;
    firstClear: string;
    rewardPending: boolean;
    displayObjectCount: number;
    activeTweenCount: number;
    averageFps: number;
    effectObjectCount: number;
  };
};

export class Match3Scene extends Phaser.Scene {
  private session: GameSession | null = null;
  private metrics: BoardLayoutMetrics | null = null;
  private background: Phaser.GameObjects.Graphics | null = null;
  private frame: Phaser.GameObjects.Graphics | null = null;
  private tileViews = new Map<string, TileView>();
  private pointerGesture: PointerGesture | null = null;
  private options: Match3SceneOptions;
  private stageSession: StageSession | null = null;
  private finishPublished = false;
  private lastSpecialCreated = 'none';
  private lastSpecialActivated = 'none';
  private lastSpecialAffectedCount = 0;
  private lastComboCount = 0;
  private lastComboEffect = 'none';
  private effectLabActive = false;

  constructor(options: Match3SceneOptions = {}) {
    super('Match3Scene');
    this.options = options;
  }

  create() {
    const stage = this.getStage();
    this.session = createGameSession(stage.seed, stage.tileKinds);
    this.stageSession = createStageSession(stage);
    this.finishPublished = false;
    this.effectLabActive = true;
    this.renderBoard();
    this.publishSession();
    this.publishStageProgress();
    this.updateDebugSnapshot();

    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerup', this.handlePointerUp, this);
    this.input.on('pointerupoutside', this.handlePointerUp, this);
    this.scale.on('resize', this.handleResize, this);
    window.addEventListener(EFFECT_LAB_EVENT, this.handleEffectLabCue);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleSceneShutdown, this);
  }

  private handleSceneShutdown() {
    if (!this.effectLabActive) {
      return;
    }

    this.effectLabActive = false;
    this.input.off('pointerdown', this.handlePointerDown, this);
    this.input.off('pointermove', this.handlePointerMove, this);
    this.input.off('pointerup', this.handlePointerUp, this);
    this.input.off('pointerupoutside', this.handlePointerUp, this);
    this.scale.off('resize', this.handleResize, this);
    window.removeEventListener(EFFECT_LAB_EVENT, this.handleEffectLabCue);
    this.destroyTileViews();

    const debugWindow = window as DebugWindow;
    if (debugWindow.__haimpangDebugOwner === this) {
      delete debugWindow.__haimpangDebug;
      delete debugWindow.__haimpangDebugOwner;
    }
  }

  private handleResize() {
    this.renderBoard();
    this.updateDebugSnapshot();
  }

  private handleEffectLabCue = (event: Event) => {
    if (!this.options.effectLabEnabled || !this.metrics || !this.effectLabActive) {
      return;
    }

    const cue = getEffectLabCue(event);
    if (!cue) {
      return;
    }

    void this.playEffectLabCue(cue);
  };

  private playEffectLabCue(cue: EffectLabCue): Promise<void> {
    if (!this.metrics) {
      return Promise.resolve();
    }

    if (
      cue === 'combo-2' ||
      cue === 'combo-5' ||
      cue === 'combo-8' ||
      cue === 'combo-10-haimpang'
    ) {
      const comboCount = cue === 'combo-2' ? 2 : cue === 'combo-5' ? 5 : cue === 'combo-8' ? 8 : 10;
      this.lastComboCount = comboCount;
      this.lastComboEffect = shouldShowHaimpangBurst(comboCount) ? 'haimpang' : 'combo';
      const preview = playComboEffect(this, comboCount, [], this.metrics);
      this.updateDebugSnapshot();
      return preview.finally(() => this.updateDebugSnapshot());
    }

    const boardSize =
      this.metrics.tileSize * this.metrics.boardWidth +
      this.metrics.gap * (this.metrics.boardWidth + 1);
    const anchor = {
      x: this.metrics.originX + boardSize / 2,
      y: this.metrics.originY + boardSize / 2,
    };

    const preview = playPopBurstEffect(this, {
      ...anchor,
      size: this.metrics.tileSize,
      kind: cue === 'special-pop' ? 'gift' : 'heart',
      specialKind: cue === 'special-pop' ? 'bomb' : undefined,
    });
    this.updateDebugSnapshot();
    return preview.finally(() => this.updateDebugSnapshot());
  }

  private setInputState(inputState: InputState) {
    if (!this.session) {
      return;
    }

    this.session.inputState = inputState;
    this.session.isBusy =
      !canAcceptBoardInput(inputState) &&
      inputState !== 'POINTER_DOWN' &&
      inputState !== 'DRAGGING';
    this.updateDebugSnapshot();
  }

  private getStage(): StageDefinition {
    return this.options.stage ?? DEFAULT_STAGE;
  }

  private calculateMetrics(): BoardLayoutMetrics {
    const width = this.scale.width;
    const height = this.scale.height;
    const boardSize = Math.floor(Math.min(width * 0.96, height * 0.96, 402));
    const gap = Math.max(5, Math.floor(boardSize * 0.014));
    const tileSize = Math.floor((boardSize - gap * (BOARD_WIDTH + 1)) / BOARD_WIDTH);
    const actualBoardSize = tileSize * BOARD_WIDTH + gap * (BOARD_WIDTH + 1);

    return {
      originX: Math.round((width - actualBoardSize) / 2),
      originY: Math.round((height - actualBoardSize) / 2),
      tileSize,
      gap,
      boardWidth: BOARD_WIDTH,
      boardHeight: BOARD_HEIGHT,
    };
  }

  private renderBoard() {
    if (!this.session) {
      return;
    }

    this.children.removeAll(true);
    this.tileViews.clear();
    this.metrics = this.calculateMetrics();
    this.background = this.add.graphics();
    this.frame = this.add.graphics();
    this.drawBackground();
    this.drawBoardFrame();

    for (const row of this.session.board) {
      for (const tile of row) {
        if (!tile) {
          continue;
        }
        const view = new TileView(this, tile, this.metrics);
        this.tileViews.set(tile.id, view);
      }
    }

    this.syncSelection();
  }

  private drawBackground() {
    if (!this.background) {
      return;
    }

    const width = this.scale.width;
    const height = this.scale.height;
    this.background.clear();
    this.background.setDepth(0);
    this.background.fillGradientStyle(0xfff9ed, 0xfff3eb, 0xf5efff, 0xeef9f3, 1);
    this.background.fillRect(0, 0, width, height);

    this.background.fillStyle(GAME_COLORS.giftRibbon, 0.09);
    this.background.fillCircle(width * 0.13, height * 0.14, Math.min(width, height) * 0.2);
    this.background.fillStyle(GAME_COLORS.lavender, 0.08);
    this.background.fillCircle(width * 0.92, height * 0.18, Math.min(width, height) * 0.22);
    this.background.fillStyle(GAME_COLORS.mint, 0.08);
    this.background.fillCircle(width * 0.1, height * 0.9, Math.min(width, height) * 0.17);

    for (let index = 0; index < 18; index += 1) {
      const x = ((index * 73 + 29) % 100) * 0.01 * width;
      const y = ((index * 47 + 17) % 100) * 0.01 * height;
      const radius = index % 3 === 0 ? 2.3 : 1.5;
      this.background.fillStyle(
        [GAME_COLORS.giftRibbon, GAME_COLORS.lavender, GAME_COLORS.mint][index % 3],
        0.11,
      );
      this.background.fillCircle(x, y, radius);
    }
  }

  private drawBoardFrame() {
    if (!this.frame || !this.metrics) {
      return;
    }

    const boardSize = this.metrics.tileSize * BOARD_WIDTH + this.metrics.gap * (BOARD_WIDTH + 1);
    const { originX, originY } = this.metrics;

    this.frame.clear();
    this.frame.setDepth(1);
    this.frame.fillStyle(0x8e4a64, 0.12);
    this.frame.fillRoundedRect(originX - 13, originY - 7, boardSize + 26, boardSize + 28, 26);
    this.frame.fillStyle(GAME_COLORS.boardCream, 0.98);
    this.frame.fillRoundedRect(originX - 13, originY - 13, boardSize + 26, boardSize + 26, 26);
    this.frame.lineStyle(2, 0xffffff, 0.92);
    this.frame.strokeRoundedRect(originX - 10, originY - 10, boardSize + 20, boardSize + 20, 23);
    this.frame.lineStyle(2, GAME_COLORS.giftRibbon, 0.42);
    this.frame.strokeRoundedRect(originX - 12, originY - 12, boardSize + 24, boardSize + 24, 25);
    this.frame.fillStyle(GAME_COLORS.boardInner, 0.82);
    this.frame.fillRoundedRect(originX, originY, boardSize, boardSize, 18);

    const cellStride = this.metrics.tileSize + this.metrics.gap;
    for (let row = 0; row < BOARD_HEIGHT; row += 1) {
      for (let col = 0; col < BOARD_WIDTH; col += 1) {
        if ((row + col) % 2 === 0) {
          this.frame.fillStyle(0xffffff, 0.14);
          this.frame.fillRoundedRect(
            originX + this.metrics.gap + col * cellStride,
            originY + this.metrics.gap + row * cellStride,
            this.metrics.tileSize,
            this.metrics.tileSize,
            this.metrics.tileSize * 0.28,
          );
        }
      }
    }

    this.frame.fillStyle(GAME_COLORS.cherry, 0.65);
    this.frame.fillCircle(originX + boardSize - 4, originY - 7, 4);
    this.frame.fillCircle(originX + boardSize + 3, originY - 4, 4);
    this.frame.lineStyle(2, 0x5f8a55, 0.7);
    this.frame.lineBetween(
      originX + boardSize,
      originY - 10,
      originX + boardSize + 5,
      originY - 16,
    );
  }

  private playBoardFrameReaction(comboCount: number) {
    if (!this.metrics || comboCount < 4) {
      return;
    }

    const boardSize = this.metrics.tileSize * BOARD_WIDTH + this.metrics.gap * (BOARD_WIDTH + 1);
    const glow = this.add.graphics();
    glow.setDepth(2);
    glow.lineStyle(
      comboCount >= 10 ? 5 : 3,
      comboCount >= 10 ? GAME_COLORS.comboGold : GAME_COLORS.giftRibbon,
      comboCount >= 10 ? 0.88 : 0.58,
    );
    glow.strokeRoundedRect(
      this.metrics.originX - 11,
      this.metrics.originY - 11,
      boardSize + 22,
      boardSize + 22,
      24,
    );

    this.tweens.add({
      targets: glow,
      alpha: { from: 0.95, to: 0 },
      duration: comboCount >= 10 ? 620 : 280,
      ease: 'Cubic.easeOut',
      onComplete: () => glow.destroy(),
    });
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (
      !this.session ||
      !this.stageSession ||
      !this.metrics ||
      this.stageSession.status !== 'playing' ||
      !canStartGesture(this.session.inputState)
    ) {
      return;
    }

    const tile = pointerToTile({ x: pointer.x, y: pointer.y }, this.metrics);
    if (!tile) {
      return;
    }

    this.session.pointerDownTile = tile;
    this.pointerGesture = {
      startX: pointer.x,
      startY: pointer.y,
      tile,
      swipeHandled: false,
      blockedByAmbiguousSwipe: false,
    };
    this.setInputState('POINTER_DOWN');
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (
      !this.session ||
      !this.metrics ||
      !this.pointerGesture ||
      this.pointerGesture.swipeHandled
    ) {
      return;
    }

    if (this.session.inputState !== 'POINTER_DOWN' && this.session.inputState !== 'DRAGGING') {
      return;
    }

    const swipe = detectSwipeDirection({
      startX: this.pointerGesture.startX,
      startY: this.pointerGesture.startY,
      currentX: pointer.x,
      currentY: pointer.y,
      tileSize: this.metrics.tileSize,
    });

    if (swipe.reason === 'below-threshold') {
      return;
    }

    this.setInputState('DRAGGING');

    if (!swipe.direction) {
      this.session.lastSwipeDirection = null;
      this.pointerGesture.blockedByAmbiguousSwipe = true;
      return;
    }

    this.session.lastSwipeDirection = swipe.direction;
    this.pointerGesture.swipeHandled = true;
    const from = this.pointerGesture.tile;
    const to = this.positionFromDirection(from, swipe.direction);
    this.pointerGesture = null;
    this.session.pointerDownTile = null;
    void this.attemptSwap(from, to);
  }

  private handlePointerUp() {
    if (!this.session || !this.pointerGesture) {
      return;
    }

    const gesture = this.pointerGesture;
    this.pointerGesture = null;
    this.session.pointerDownTile = null;

    if (gesture.swipeHandled) {
      return;
    }

    if (gesture.blockedByAmbiguousSwipe) {
      this.setInputState('READY');
      return;
    }

    this.setInputState('READY');
    void this.handleTap(gesture.tile);
  }

  private async handleTap(tile: BoardPosition): Promise<void> {
    if (
      !this.session ||
      !this.stageSession ||
      this.stageSession.status !== 'playing' ||
      !canAcceptBoardInput(this.session.inputState)
    ) {
      return;
    }

    const selected = this.session.selectedTile;
    if (!selected) {
      this.session.selectedTile = tile;
      this.syncSelection();
      this.updateDebugSnapshot();
      return;
    }

    if (selected.row === tile.row && selected.col === tile.col) {
      this.session.selectedTile = null;
      this.syncSelection();
      this.updateDebugSnapshot();
      return;
    }

    if (Math.abs(selected.row - tile.row) + Math.abs(selected.col - tile.col) === 1) {
      await this.attemptSwap(selected, tile);
      return;
    }

    this.session.selectedTile = tile;
    this.syncSelection();
    this.updateDebugSnapshot();
  }

  private async attemptSwap(from: BoardPosition, to: BoardPosition): Promise<void> {
    if (
      !this.session ||
      !this.stageSession ||
      !this.metrics ||
      this.stageSession.status !== 'playing'
    ) {
      return;
    }

    this.session.pointerDownTile = null;

    if (!isInsideBoard(to.row, to.col, BOARD_WIDTH, BOARD_HEIGHT)) {
      this.session.selectedTile = null;
      this.setInputState('READY');
      this.syncSelection();
      return;
    }

    const fromTile = getTile(this.session.board, from);
    const toTile = getTile(this.session.board, to);
    const fromView = fromTile ? this.tileViews.get(fromTile.id) : undefined;
    const toView = toTile ? this.tileViews.get(toTile.id) : undefined;

    if (!fromTile || !toTile || !fromView || !toView) {
      this.session.selectedTile = null;
      this.setInputState('READY');
      this.syncSelection();
      return;
    }

    this.setInputState('SWAP_ATTEMPT');
    const resolution = resolveMoveWithSpecials(
      this.session.board,
      { from, to },
      {
        seed: `${this.session.seed}:move:${this.stageSession.movesUsed + 1}`,
        tileKinds: this.getStage().tileKinds,
      },
    );

    if (!resolution.valid) {
      this.setInputState('INVALID_ROLLBACK');
      playFeedback('swap-invalid', this.options.vibrationEnabled);
      await invalidSwapRollback(this, fromView, toView, to, from, this.metrics);
      this.session.selectedTile = null;
      this.session.lastMatches = [];
      this.syncSelection();
      this.setInputState('READY');
      this.publishStageProgress();
      this.publishSession();
      return;
    }

    this.setInputState('SWAP_ANIMATING');
    playFeedback('swap-valid', this.options.vibrationEnabled);
    await swapTileViews(this, fromView, toView, to, from, this.metrics, EFFECT_TIMINGS.swapMs);
    this.session.board = resolution.swappedBoard;
    this.session.moveCount += 1;
    this.session.lastMatches = resolution.cascade.steps[0]?.matches ?? [];
    this.session.selectedTile = null;
    this.syncSelection();
    this.setInputState('MATCH_CHECK');

    const cascadeResult = await this.playCascade(resolution.cascade);
    this.session.board = resolution.board;
    this.session.lastMatches = [];
    this.stageSession = applyMoveResult(
      this.stageSession,
      {
        ...cascadeResult,
        validMove: true,
      },
      this.getStage(),
    );
    this.session.score = this.stageSession.score;
    this.session.moveCount = this.stageSession.movesUsed;

    if (this.stageSession.status === 'won' || this.stageSession.status === 'lost') {
      this.setInputState(this.stageSession.status === 'won' ? 'WIN' : 'LOSE');
      this.publishStageProgress();
      this.publishStageFinished();
      this.publishSession();
      return;
    }

    this.setInputState('READY');
    this.publishStageProgress();
    this.publishSession();
  }

  private async playCascade(cascade: CascadeResult): Promise<CascadeAnimationResult> {
    if (!this.session || !this.metrics) {
      return {
        scoreGained: 0,
        removedTiles: [],
        createdSpecials: [],
        activatedSpecials: [],
        cascadeCount: 0,
      };
    }

    this.session.cascadeCount = cascade.steps.length;
    let scoreGained = 0;
    const removedTiles: Array<{ kind: TileKind }> = [];
    const createdSpecials: Array<{ specialKind: SpecialTileKind }> = [];
    const activatedSpecials: Array<{ specialKind: SpecialTileKind }> = [];
    this.lastComboCount = 0;
    this.lastComboEffect = 'none';

    for (let index = 0; index < cascade.steps.length; index += 1) {
      const step = cascade.steps[index];
      const cascadeIndex = index + 1;
      this.session.lastMatches = step.matches;
      this.setInputState('POPPING');
      playFeedback(
        step.specialActivations.length > 0 ? 'special-pop' : 'pop',
        this.options.vibrationEnabled,
      );
      if (cascadeIndex >= 2) {
        this.lastComboCount = cascadeIndex;
        this.lastComboEffect = shouldShowHaimpangBurst(cascadeIndex) ? 'haimpang' : 'combo';
        this.time.delayedCall(28, () => {
          playFeedback(
            shouldShowHaimpangBurst(cascadeIndex) ? 'haimpang-finish' : 'combo-up',
            this.options.vibrationEnabled,
          );
        });
        this.updateDebugSnapshot();
        this.playBoardFrameReaction(cascadeIndex);
      }
      createdSpecials.push(
        ...step.specialCreations.map((creation) => ({ specialKind: creation.specialKind })),
      );
      activatedSpecials.push(
        ...step.specialActivations.map((activation) => ({ specialKind: activation.specialKind })),
      );

      for (const creation of step.specialCreations) {
        const tile = getTileAt(step.boardBefore, creation.position);
        const view = tile ? this.tileViews.get(tile.id) : undefined;
        if (tile && view) {
          view.updateTile(
            {
              ...tile,
              kind: creation.kind,
              specialKind: creation.specialKind,
              position: { ...creation.position },
            },
            this.metrics,
          );
          this.lastSpecialCreated = creation.specialKind;
        }
      }

      if (step.specialActivations.length > 0) {
        const lastActivation = step.specialActivations[step.specialActivations.length - 1];
        this.lastSpecialActivated = lastActivation.specialKind;
        this.lastSpecialAffectedCount = lastActivation.affectedPositions.length;
        await playSpecialActivationEffects(this, step.specialActivations, this.metrics);
        this.playBoardFrameReaction(4);
      }

      const popViews = step.removedPositions
        .map((position) => getTileAt(step.boardBefore, position))
        .map((tile) => (tile ? this.tileViews.get(tile.id) : undefined))
        .filter((view): view is TileView => Boolean(view));
      removedTiles.push(
        ...step.removedPositions
          .map((position) => getTileAt(step.boardBefore, position))
          .filter((tile): tile is BoardTile => Boolean(tile))
          .map((tile) => ({ kind: tile.kind })),
      );

      await Promise.all([
        popTileViews(popViews),
        playComboEffect(this, cascadeIndex, step.removedPositions, this.metrics),
      ]);
      for (const view of popViews) {
        this.tileViews.delete(view.tileId);
        view.destroy();
      }

      const stepScore = scoreRemovedTiles(step.removedPositions.length, cascadeIndex);
      const specialBonus = step.specialActivations.reduce(
        (sum, activation) => sum + SPECIAL_SCORE_BONUS[activation.specialKind],
        0,
      );
      scoreGained += stepScore + specialBonus;
      this.session.score += stepScore + specialBonus;
      this.setInputState('DROPPING');
      const movements = deriveTileMovements(step.boardBefore, step.droppedBoard);
      await Promise.all(
        movements.map((movement) => {
          const view = this.tileViews.get(movement.tileId);
          if (!view || !this.metrics) {
            return Promise.resolve();
          }
          return moveTileView(
            this,
            view,
            movement.to,
            this.metrics,
            Math.max(80, movement.distance * EFFECT_TIMINGS.dropMsPerCell),
          );
        }),
      );

      this.setInputState('REFILLING');
      const spawns = deriveRefillSpawns(step.droppedBoard, step.refilledBoard);
      const refillViews = spawns.map((spawn) => {
        if (!this.metrics) {
          return null;
        }
        const view = new TileView(this, spawn.tile, this.metrics, spawn.spawnRow);
        this.tileViews.set(spawn.tile.id, view);
        return view;
      });

      await Promise.all(
        refillViews.map((view) => {
          if (!view || !this.metrics) {
            return Promise.resolve();
          }
          return moveTileView(
            this,
            view,
            { row: view.row, col: view.col },
            this.metrics,
            EFFECT_TIMINGS.refillMs,
          );
        }),
      );

      this.session.board = step.refilledBoard;
      if (index < cascade.steps.length - 1) {
        this.setInputState('CASCADE_CHECK');
        playFeedback('cascade', this.options.vibrationEnabled);
        await this.delay(EFFECT_TIMINGS.cascadeDelayMs);
      }
    }

    return {
      scoreGained,
      removedTiles,
      createdSpecials,
      activatedSpecials,
      cascadeCount: cascade.steps.length,
    };
  }

  private positionFromDirection(position: BoardPosition, direction: SwipeDirection): BoardPosition {
    if (direction === 'left') {
      return { row: position.row, col: position.col - 1 };
    }
    if (direction === 'right') {
      return { row: position.row, col: position.col + 1 };
    }
    if (direction === 'up') {
      return { row: position.row - 1, col: position.col };
    }
    return { row: position.row + 1, col: position.col };
  }

  private syncSelection() {
    if (!this.session || !this.metrics) {
      return;
    }

    for (const view of this.tileViews.values()) {
      view.setSelected(false);
    }

    if (!this.session.selectedTile) {
      return;
    }

    const tile = getTile(this.session.board, this.session.selectedTile);
    if (!tile) {
      this.session.selectedTile = null;
      return;
    }

    this.tileViews.get(tile.id)?.setSelected(true);
  }

  private publishSession() {
    if (!this.session) {
      return;
    }

    this.options.onSessionChange?.(toSessionSummary(this.session));
    this.updateDebugSnapshot();
  }

  private publishStageProgress() {
    if (!this.session || !this.stageSession) {
      return;
    }

    this.options.onStageProgress?.(
      toStageProgressSummary(this.stageSession, this.session.inputState),
    );
    this.updateDebugSnapshot();
  }

  private publishStageFinished() {
    if (!this.stageSession || this.finishPublished) {
      return;
    }

    const result = toStageFinishResult(this.stageSession, this.getStage());
    if (!result) {
      return;
    }

    this.finishPublished = true;
    this.options.onStageFinished?.(result);
  }

  private updateDebugSnapshot() {
    if (!this.session || !this.stageSession || !this.metrics || typeof window === 'undefined') {
      return;
    }

    const boardSize = this.metrics.tileSize * BOARD_WIDTH + this.metrics.gap * (BOARD_WIDTH + 1);
    const selectedTile = this.session.selectedTile
      ? `${this.session.selectedTile.row},${this.session.selectedTile.col}`
      : 'none';
    const pointerDownTile = this.session.pointerDownTile
      ? `${this.session.pointerDownTile.row},${this.session.pointerDownTile.col}`
      : 'none';
    const specialTileCount = this.session.board
      .flat()
      .filter((tile) => Boolean(tile?.specialKind)).length;
    const createdSpecialCount = Object.values(this.stageSession.createdSpecialCounts).reduce(
      (sum, value) => sum + (value ?? 0),
      0,
    );
    const activatedSpecialCount = Object.values(this.stageSession.activatedSpecialCounts).reduce(
      (sum, value) => sum + (value ?? 0),
      0,
    );

    const debugWindow = window as DebugWindow;
    debugWindow.__haimpangDebugOwner = this;
    debugWindow.__haimpangDebug = {
      inputState: this.session.inputState,
      selectedTile,
      pointerDownTile,
      lastSwipeDirection: this.session.lastSwipeDirection ?? 'none',
      boardSize,
      tileSize: this.metrics.tileSize,
      score: this.session.score,
      moveCount: this.session.moveCount,
      cascadeCount: this.session.cascadeCount,
      seed: String(this.session.seed),
      inputLocked: !canAcceptBoardInput(this.session.inputState),
      possibleMoves: findPossibleMoves(this.session.board),
      boardKinds: boardToKindRows(this.session.board),
      stageId: this.stageSession.stageId,
      stageStatus: this.stageSession.status,
      movesRemaining: this.stageSession.movesRemaining,
      missionProgress: this.stageSession.missionProgress
        .map((mission) => `${mission.current}/${mission.required}`)
        .join(','),
      specialTileCount,
      createdSpecialCount,
      activatedSpecialCount,
      lastSpecialCreated: this.lastSpecialCreated,
      lastSpecialActivated: this.lastSpecialActivated,
      lastSpecialAffectedCount: this.lastSpecialAffectedCount,
      lastComboCount: this.lastComboCount,
      lastComboEffect: this.lastComboEffect,
      firstClear: 'react-owned',
      rewardPending: this.stageSession.status === 'won',
      displayObjectCount: this.children.list.length,
      activeTweenCount: this.tweens.getTweens().length,
      averageFps: Math.round(this.game.loop.actualFps || 0),
      effectObjectCount: this.children.list.filter((child) => {
        const depth = 'depth' in child ? child.depth : 0;
        return typeof depth === 'number' && depth >= 10;
      }).length,
    };
  }

  private destroyTileViews() {
    for (const view of this.tileViews.values()) {
      view.destroy();
    }
    this.tileViews.clear();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.time.delayedCall(ms, () => resolve());
    });
  }
}
