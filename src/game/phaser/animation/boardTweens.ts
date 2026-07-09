import Phaser from 'phaser';
import type { BoardPosition } from '../../core/types';
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
