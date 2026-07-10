import type Phaser from 'phaser';
import type { BoardPosition } from '../../core/types';
import type { BoardLayoutMetrics } from '../../input/pointerToTile';

export type ComboEffectTier = 'none' | 'soft' | 'bright' | 'celebration' | 'haimpang';

export interface EffectAnchor {
  x: number;
  y: number;
}

type TweenConfigWithoutTargets = Omit<
  Phaser.Types.Tweens.TweenBuilderConfig,
  'targets' | 'onComplete'
>;

const PASTEL_SPARKLE_COLORS = [0xff7fa6, 0xffd36a, 0xfffbef, 0xb9a8ff, 0x75d2bd];

export function shouldShowComboText(comboCount: number): boolean {
  return comboCount >= 2;
}

export function shouldShowHaimpangBurst(comboCount: number): boolean {
  return comboCount >= 10;
}

export function getComboEffectTier(comboCount: number): ComboEffectTier {
  if (comboCount < 2) {
    return 'none';
  }
  if (comboCount >= 10) {
    return 'haimpang';
  }
  if (comboCount >= 7) {
    return 'celebration';
  }
  if (comboCount >= 4) {
    return 'bright';
  }
  return 'soft';
}

export function getComboEffectDuration(comboCount: number): number {
  const tier = getComboEffectTier(comboCount);

  if (tier === 'haimpang') {
    return 660;
  }
  if (tier === 'celebration') {
    return 540;
  }
  return 500;
}

export function getEffectAnchorFromMatchedPositions(
  positions: BoardPosition[],
  metrics: BoardLayoutMetrics,
): EffectAnchor {
  const boardSize = metrics.tileSize * metrics.boardWidth + metrics.gap * (metrics.boardWidth + 1);

  if (positions.length === 0) {
    return {
      x: metrics.originX + boardSize / 2,
      y: metrics.originY + boardSize / 2,
    };
  }

  const total = positions.reduce(
    (accumulator, position) => {
      const topLeftX =
        metrics.originX + metrics.gap + position.col * (metrics.tileSize + metrics.gap);
      const topLeftY =
        metrics.originY + metrics.gap + position.row * (metrics.tileSize + metrics.gap);

      return {
        x: accumulator.x + topLeftX + metrics.tileSize / 2,
        y: accumulator.y + topLeftY + metrics.tileSize / 2,
      };
    },
    { x: 0, y: 0 },
  );

  return {
    x: total.x / positions.length,
    y: total.y / positions.length,
  };
}

export function playComboEffect(
  scene: Phaser.Scene,
  comboCount: number,
  positions: BoardPosition[],
  metrics: BoardLayoutMetrics,
): Promise<void> {
  if (!shouldShowComboText(comboCount)) {
    return Promise.resolve();
  }

  const anchor = getEffectAnchorFromMatchedPositions(positions, metrics);
  const tier = getComboEffectTier(comboCount);

  if (shouldShowHaimpangBurst(comboCount)) {
    return Promise.all([
      showComboText(
        scene,
        comboCount,
        { x: anchor.x, y: anchor.y - metrics.tileSize * 0.72 },
        tier,
      ),
      showHaimpangBurst(scene, anchor, metrics),
    ]).then(() => undefined);
  }

  return showComboText(scene, comboCount, anchor, tier);
}

function showComboText(
  scene: Phaser.Scene,
  comboCount: number,
  anchor: EffectAnchor,
  tier: ComboEffectTier,
): Promise<void> {
  const duration = getComboEffectDuration(comboCount);
  const fontSize = tier === 'soft' ? 19 : tier === 'bright' ? 22 : tier === 'celebration' ? 24 : 26;
  const stroke = tier === 'soft' ? '#ff7fa6' : tier === 'bright' ? '#f1a82c' : '#8d77f4';
  const rise = tier === 'soft' ? 28 : tier === 'bright' ? 34 : 40;
  const text = scene.add.text(anchor.x, anchor.y, `${comboCount} COMBO`, {
    fontFamily: 'Trebuchet MS, Arial, sans-serif',
    fontSize: `${fontSize}px`,
    fontStyle: '900',
    color: '#fff7e8',
    stroke,
    strokeThickness: 4,
    align: 'center',
  });

  text.setOrigin(0.5);
  text.setDepth(19);
  text.setScale(0.85);
  text.setShadow(0, 2, '#8b3651', 5, true, true);

  return new Promise((resolve) => {
    scene.tweens.add({
      targets: text,
      scale: 1.08,
      y: anchor.y - 6,
      duration: 130,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.tweens.add({
          targets: text,
          scale: 1,
          y: anchor.y - rise,
          alpha: 0,
          duration: duration - 130,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            text.destroy();
            resolve();
          },
        });
      },
    });
  });
}

function showHaimpangBurst(
  scene: Phaser.Scene,
  anchor: EffectAnchor,
  metrics: BoardLayoutMetrics,
): Promise<void> {
  const glow = scene.add.graphics();
  const radius = metrics.tileSize * 1.55;
  const text = scene.add.text(anchor.x, anchor.y + metrics.tileSize * 0.34, '하임팡!', {
    fontFamily: 'Noto Sans KR, Pretendard, Arial, sans-serif',
    fontSize: `${Math.max(28, metrics.tileSize * 0.78)}px`,
    fontStyle: '900',
    color: '#fff8df',
    stroke: '#ff7fa6',
    strokeThickness: 6,
    align: 'center',
  });

  glow.setDepth(18);
  glow.setPosition(anchor.x, anchor.y);
  glow.fillStyle(0xfff1c7, 0.28);
  glow.fillCircle(0, 0, radius);
  glow.fillStyle(0xff7fa6, 0.12);
  glow.fillCircle(0, 0, radius * 1.24);
  glow.lineStyle(3, 0xffffff, 0.74);
  glow.strokeCircle(0, 0, radius * 0.7);

  for (let index = 0; index < 12; index += 1) {
    const angle = (Math.PI * 2 * index) / 12;
    const inner = radius * 0.42;
    const outer = radius * (index % 2 === 0 ? 1.08 : 0.88);
    const color = PASTEL_SPARKLE_COLORS[index % PASTEL_SPARKLE_COLORS.length];

    glow.lineStyle(3, color, 0.62);
    glow.lineBetween(
      Math.cos(angle) * inner,
      Math.sin(angle) * inner,
      Math.cos(angle) * outer,
      Math.sin(angle) * outer,
    );
  }

  text.setOrigin(0.5);
  text.setDepth(20);
  text.setScale(0.82);
  text.setShadow(0, 3, '#8b3651', 6, true, true);

  return Promise.all([
    tweenAndDestroy(scene, glow, {
      scale: { from: 0.7, to: 1.22 },
      alpha: { from: 0.95, to: 0 },
      angle: 12,
      duration: 660,
      ease: 'Cubic.easeOut',
    }),
    spawnSparkleBurst(scene, anchor, metrics.tileSize),
    tweenTextAndDestroy(scene, text, anchor.y - metrics.tileSize * 0.56),
  ]).then(() => undefined);
}

function spawnSparkleBurst(
  scene: Phaser.Scene,
  anchor: EffectAnchor,
  tileSize: number,
): Promise<void> {
  const graphics = scene.add.graphics();
  const radius = tileSize * 1.62;
  const dotCount = 18;

  graphics.setDepth(21);
  graphics.setPosition(anchor.x, anchor.y);

  for (let index = 0; index < dotCount; index += 1) {
    const angle = (Math.PI * 2 * index) / dotCount + 0.14;
    const distance = radius * (0.58 + (index % 4) * 0.12);
    const dotRadius = Math.max(2, tileSize * (index % 3 === 0 ? 0.095 : 0.065));
    const color = PASTEL_SPARKLE_COLORS[index % PASTEL_SPARKLE_COLORS.length];
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    graphics.fillStyle(color, 0.84);
    graphics.fillCircle(x, y, dotRadius);
    graphics.lineStyle(2, 0xffffff, 0.58);
    graphics.lineBetween(x - dotRadius * 1.6, y, x + dotRadius * 1.6, y);
    graphics.lineBetween(x, y - dotRadius * 1.6, x, y + dotRadius * 1.6);
  }

  return tweenAndDestroy(scene, graphics, {
    scale: { from: 0.78, to: 1.24 },
    alpha: { from: 0.94, to: 0 },
    angle: -8,
    duration: 620,
    ease: 'Cubic.easeOut',
  });
}

function tweenTextAndDestroy(
  scene: Phaser.Scene,
  text: Phaser.GameObjects.Text,
  targetY: number,
): Promise<void> {
  return new Promise((resolve) => {
    scene.tweens.add({
      targets: text,
      scale: 1.08,
      duration: 160,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.tweens.add({
          targets: text,
          scale: 1,
          y: targetY,
          alpha: 0,
          duration: 500,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            text.destroy();
            resolve();
          },
        });
      },
    });
  });
}

function tweenAndDestroy(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  config: TweenConfigWithoutTargets,
): Promise<void> {
  return new Promise((resolve) => {
    scene.tweens.add({
      targets: target,
      ...config,
      onComplete: () => {
        target.destroy();
        resolve();
      },
    });
  });
}
