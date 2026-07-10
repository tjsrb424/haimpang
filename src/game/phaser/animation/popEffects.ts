import type Phaser from 'phaser';
import type { SpecialTileKind, TileKind } from '../../core/types';
import { getTilePresentation } from '../../presentation/tilePresentation';

export interface PopBurstOptions {
  x: number;
  y: number;
  size: number;
  kind: TileKind;
  specialKind?: SpecialTileKind;
}

function createPopBurst(
  scene: Phaser.Scene,
  options: PopBurstOptions,
): Phaser.GameObjects.Graphics {
  const presentation = getTilePresentation(options.kind);
  const isSpecial = Boolean(options.specialKind);
  const radius = options.size * (isSpecial ? 0.74 : 0.56);
  const dotCount = isSpecial ? 10 : 6;
  const rayCount = isSpecial ? 8 : 4;
  const graphics = scene.add.graphics();

  graphics.setDepth(isSpecial ? 14 : 10);
  graphics.setPosition(options.x, options.y);
  graphics.lineStyle(isSpecial ? 3 : 2, 0xffffff, isSpecial ? 0.82 : 0.66);
  graphics.strokeCircle(0, 0, radius * 0.44);
  graphics.lineStyle(2, presentation.darkColor, isSpecial ? 0.58 : 0.4);
  graphics.strokeCircle(0, 0, radius * 0.72);

  for (let index = 0; index < rayCount; index += 1) {
    const angle = (Math.PI * 2 * index) / rayCount + 0.18;
    const inner = radius * 0.36;
    const outer = radius * (isSpecial ? 1.06 : 0.92);

    graphics.lineStyle(
      isSpecial ? 3 : 2,
      index % 2 === 0 ? 0xfffbef : presentation.primaryColor,
      0.62,
    );
    graphics.lineBetween(
      Math.cos(angle) * inner,
      Math.sin(angle) * inner,
      Math.cos(angle) * outer,
      Math.sin(angle) * outer,
    );
  }

  for (let index = 0; index < dotCount; index += 1) {
    const angle = (Math.PI * 2 * index) / dotCount + (isSpecial ? 0.1 : 0.32);
    const distance = radius * (0.72 + (index % 3) * 0.12);
    const dotRadius = Math.max(2, options.size * (isSpecial && index % 2 === 0 ? 0.09 : 0.065));
    const color =
      index % 3 === 0 ? 0xfffbef : presentation.popColors[index % presentation.popColors.length];

    graphics.fillStyle(color, index % 3 === 0 ? 0.95 : 0.78);
    graphics.fillCircle(Math.cos(angle) * distance, Math.sin(angle) * distance, dotRadius);
  }

  return graphics;
}

export function playPopBurstEffect(scene: Phaser.Scene, options: PopBurstOptions): Promise<void> {
  const isSpecial = Boolean(options.specialKind);
  const burst = createPopBurst(scene, options);

  return new Promise((resolve) => {
    scene.tweens.add({
      targets: burst,
      scale: { from: 0.72, to: isSpecial ? 1.28 : 1.12 },
      alpha: { from: 0.96, to: 0 },
      duration: isSpecial ? 270 : 230,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        burst.destroy();
        resolve();
      },
    });
  });
}
