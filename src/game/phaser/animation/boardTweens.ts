import Phaser from 'phaser';
import type { BoardPosition, SpecialActivation } from '../../core/types';
import type { BoardLayoutMetrics } from '../../input/pointerToTile';
import { EFFECT_TIMINGS } from '../../ui/effects';
import { TileView } from '../objects/TileView';

function tweenPromise(scene: Phaser.Scene, config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
  return new Promise((resolve) => {
    scene.tweens.add({
      ...config,
      onComplete: () => resolve(),
    });
  });
}

export function moveTileView(
  scene: Phaser.Scene,
  view: TileView,
  position: BoardPosition,
  metrics: BoardLayoutMetrics,
  duration: number,
): Promise<void> {
  const target = TileView.toScenePosition(position.row, position.col, metrics);
  return tweenPromise(scene, {
    targets: view.container,
    x: target.x,
    y: target.y,
    duration,
    ease: 'Sine.easeInOut',
  }).then(() => {
    view.setBoardPosition(position.row, position.col);
  });
}

export function swapTileViews(
  scene: Phaser.Scene,
  first: TileView,
  second: TileView,
  firstTarget: BoardPosition,
  secondTarget: BoardPosition,
  metrics: BoardLayoutMetrics,
  duration: number = EFFECT_TIMINGS.swapMs,
): Promise<void> {
  return Promise.all([
    moveTileView(scene, first, firstTarget, metrics, duration),
    moveTileView(scene, second, secondTarget, metrics, duration),
  ]).then(() => undefined);
}

export async function invalidSwapRollback(
  scene: Phaser.Scene,
  first: TileView,
  second: TileView,
  firstTarget: BoardPosition,
  secondTarget: BoardPosition,
  metrics: BoardLayoutMetrics,
): Promise<void> {
  await swapTileViews(scene, first, second, firstTarget, secondTarget, metrics, EFFECT_TIMINGS.invalidForwardMs);
  await swapTileViews(scene, first, second, secondTarget, firstTarget, metrics, EFFECT_TIMINGS.invalidRollbackMs);
}

export function popTileViews(views: TileView[]): Promise<void> {
  return Promise.all(views.map((view) => view.playPop())).then(() => undefined);
}

function boardPixelSize(metrics: BoardLayoutMetrics): number {
  return metrics.tileSize * metrics.boardWidth + metrics.gap * (metrics.boardWidth + 1);
}

function tileCenter(position: BoardPosition, metrics: BoardLayoutMetrics): { x: number; y: number } {
  const topLeft = TileView.toScenePosition(position.row, position.col, metrics);

  return {
    x: topLeft.x + metrics.tileSize / 2,
    y: topLeft.y + metrics.tileSize / 2,
  };
}

function playLineSweep(
  scene: Phaser.Scene,
  activation: SpecialActivation,
  metrics: BoardLayoutMetrics,
): Promise<void> {
  const graphics = scene.add.graphics();
  const thickness = Math.max(12, metrics.tileSize * 0.34);
  const size = boardPixelSize(metrics);
  const center = tileCenter(activation.position, metrics);

  graphics.setDepth(12);
  graphics.fillStyle(0xffffff, 0.78);
  graphics.lineStyle(2, 0xff7197, 0.72);

  if (activation.specialKind === 'line_horizontal') {
    graphics.setPosition(metrics.originX, center.y);
    graphics.fillRoundedRect(0, -thickness / 2, size, thickness, thickness / 2);
    graphics.strokeRoundedRect(0, -thickness / 2, size, thickness, thickness / 2);
    graphics.setScale(0.08, 1);
  } else {
    graphics.setPosition(center.x, metrics.originY);
    graphics.fillRoundedRect(-thickness / 2, 0, thickness, size, thickness / 2);
    graphics.strokeRoundedRect(-thickness / 2, 0, thickness, size, thickness / 2);
    graphics.setScale(1, 0.08);
  }

  return tweenPromise(scene, {
    targets: graphics,
    scaleX: 1,
    scaleY: 1,
    alpha: { from: 0.92, to: 0 },
    duration: 180,
    ease: 'Sine.easeOut',
  }).then(() => graphics.destroy());
}

function playBombPulse(
  scene: Phaser.Scene,
  activation: SpecialActivation,
  metrics: BoardLayoutMetrics,
): Promise<void> {
  const graphics = scene.add.graphics();
  const center = tileCenter(activation.position, metrics);
  const radius = metrics.tileSize * 1.28;

  graphics.setDepth(12);
  graphics.setPosition(center.x, center.y);
  graphics.fillStyle(0xffd166, 0.24);
  graphics.fillCircle(0, 0, radius);
  graphics.lineStyle(4, 0xffffff, 0.82);
  graphics.strokeCircle(0, 0, radius * 0.72);

  return tweenPromise(scene, {
    targets: graphics,
    scale: { from: 0.42, to: 1.1 },
    alpha: { from: 0.95, to: 0 },
    duration: 220,
    ease: 'Cubic.easeOut',
  }).then(() => graphics.destroy());
}

function playRainbowSparkle(
  scene: Phaser.Scene,
  activation: SpecialActivation,
  metrics: BoardLayoutMetrics,
): Promise<void> {
  const graphics = scene.add.graphics();
  const colors = [0xff7197, 0xffd166, 0x65c7b4, 0x8f7cf7];

  graphics.setDepth(12);
  for (const [index, position] of activation.affectedPositions.entries()) {
    const center = tileCenter(position, metrics);
    const color = colors[index % colors.length];
    graphics.fillStyle(color, 0.34);
    graphics.fillCircle(center.x, center.y, Math.max(5, metrics.tileSize * 0.18));
    graphics.lineStyle(2, 0xffffff, 0.62);
    graphics.strokeCircle(center.x, center.y, Math.max(7, metrics.tileSize * 0.24));
  }

  return tweenPromise(scene, {
    targets: graphics,
    alpha: { from: 0.95, to: 0 },
    duration: 220,
    ease: 'Sine.easeOut',
  }).then(() => graphics.destroy());
}

export function playSpecialActivationEffects(
  scene: Phaser.Scene,
  activations: SpecialActivation[],
  metrics: BoardLayoutMetrics,
): Promise<void> {
  return Promise.all(
    activations.map((activation) => {
      if (activation.specialKind === 'line_horizontal' || activation.specialKind === 'line_vertical') {
        return playLineSweep(scene, activation, metrics);
      }
      if (activation.specialKind === 'bomb') {
        return playBombPulse(scene, activation, metrics);
      }
      return playRainbowSparkle(scene, activation, metrics);
    }),
  ).then(() => undefined);
}
