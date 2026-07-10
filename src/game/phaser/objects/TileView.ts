import Phaser from 'phaser';
import type { BoardTile, SpecialTileKind, TileKind } from '../../core/types';
import type { BoardLayoutMetrics } from '../../input/pointerToTile';
import { GAME_DEPTH } from '../../presentation/designTokens';
import { getTilePresentation, type TilePresentation } from '../../presentation/tilePresentation';
import { playPopBurstEffect } from '../animation/popEffects';

export class TileView {
  tileId: string;
  kind: TileKind;
  specialKind?: SpecialTileKind;
  row: number;
  col: number;
  container: Phaser.GameObjects.Container;

  private scene: Phaser.Scene;
  private berryLayer: Phaser.GameObjects.Container;
  private shadow: Phaser.GameObjects.Graphics;
  private fallback: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Image;
  private specialOverlay: Phaser.GameObjects.Graphics;
  private selection: Phaser.GameObjects.Graphics;
  private selectedTween: Phaser.Tweens.Tween | null = null;
  private currentTileSize = 40;

  constructor(
    scene: Phaser.Scene,
    tile: BoardTile,
    metrics: BoardLayoutMetrics,
    spawnRow = tile.position.row,
  ) {
    this.scene = scene;
    this.tileId = tile.id;
    this.kind = tile.kind;
    this.specialKind = tile.specialKind;
    this.row = tile.position.row;
    this.col = tile.position.col;
    this.selection = scene.add.graphics();
    this.shadow = scene.add.graphics();
    this.fallback = scene.add.graphics();

    const presentation = getTilePresentation(tile.kind);
    const textureKey = scene.textures.exists(presentation.textureKey)
      ? presentation.textureKey
      : '__WHITE';
    this.sprite = scene.add.image(0, 0, textureKey);
    this.specialOverlay = scene.add.graphics();
    this.berryLayer = scene.add.container(0, 0, [
      this.shadow,
      this.fallback,
      this.sprite,
      this.specialOverlay,
    ]);
    this.container = scene.add.container(0, 0, [this.selection, this.berryLayer]);
    this.container.setDepth(GAME_DEPTH.tile);
    this.redraw(metrics);
    this.setScenePosition(spawnRow, tile.position.col, metrics);
  }

  updateTile(tile: BoardTile, metrics: BoardLayoutMetrics): void {
    this.tileId = tile.id;
    this.kind = tile.kind;
    this.specialKind = tile.specialKind;
    this.row = tile.position.row;
    this.col = tile.position.col;
    this.redraw(metrics);
  }

  setBoardPosition(row: number, col: number): void {
    this.row = row;
    this.col = col;
  }

  setSelected(selected: boolean): void {
    this.selection.setVisible(selected);

    if (this.selectedTween) {
      this.selectedTween.stop();
      this.selectedTween = null;
    }

    this.selection.setScale(1).setAlpha(1);
    this.berryLayer.setScale(1);
    this.container.setDepth(selected ? GAME_DEPTH.selected : GAME_DEPTH.tile);

    if (selected) {
      this.selectedTween = this.scene.tweens.add({
        targets: [this.selection, this.berryLayer],
        scale: { from: 1, to: 1.045 },
        duration: 720,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    }
  }

  redraw(metrics: BoardLayoutMetrics): void {
    const presentation = getTilePresentation(this.kind);
    const size = metrics.tileSize;
    const center = size / 2;

    this.currentTileSize = size;
    this.shadow.clear();
    this.fallback.clear();
    this.selection.clear();
    this.specialOverlay.clear();

    this.drawSelection(size, presentation);
    this.shadow.fillStyle(presentation.darkColor, 0.18);
    this.shadow.fillEllipse(center + 1, center + size * 0.14, size * 0.76, size * 0.34);

    const hasTexture = this.scene.textures.exists(presentation.textureKey);
    this.sprite.setVisible(hasTexture);
    this.fallback.setVisible(!hasTexture);
    if (hasTexture) {
      this.sprite.setTexture(presentation.textureKey);
      this.sprite.setPosition(center, center);
      this.sprite.setDisplaySize(size * 1.08, size * 1.08);
    } else {
      this.drawFallbackBerry(size, presentation);
    }

    this.drawSpecialOverlay(size);
    this.container.setSize(size, size);
  }

  private drawSelection(size: number, presentation: TilePresentation): void {
    const center = size / 2;

    this.selection.fillStyle(0xfff2d9, 0.68);
    this.selection.fillCircle(center, center, size * 0.59);
    this.selection.lineStyle(2.5, 0xffffff, 0.94);
    this.selection.strokeCircle(center, center, size * 0.55);
    this.selection.lineStyle(2, presentation.highlightColor, 0.8);
    this.selection.strokeCircle(center, center, size * 0.62);

    for (const [x, y] of [
      [0.16, 0.18],
      [0.84, 0.78],
    ] as const) {
      const sparkleSize = Math.max(2, size * 0.08);
      this.selection.lineStyle(2, 0xffffff, 0.9);
      this.selection.lineBetween(
        size * x - sparkleSize,
        size * y,
        size * x + sparkleSize,
        size * y,
      );
      this.selection.lineBetween(
        size * x,
        size * y - sparkleSize,
        size * x,
        size * y + sparkleSize,
      );
    }

    this.selection.setVisible(false);
  }

  private drawFallbackBerry(size: number, presentation: TilePresentation): void {
    const center = size / 2;
    const radius = size * 0.36;

    this.fallback.fillStyle(presentation.primaryColor, 1);
    this.fallback.lineStyle(2, presentation.darkColor, 0.86);

    if (presentation.silhouette === 'heart') {
      this.fallback.beginPath();
      this.fallback.moveTo(center, size * 0.86);
      this.fallback.lineTo(size * 0.18, size * 0.42);
      this.fallback.arc(size * 0.35, size * 0.34, size * 0.18, Math.PI, 0);
      this.fallback.arc(size * 0.65, size * 0.34, size * 0.18, Math.PI, 0);
      this.fallback.closePath();
      this.fallback.fillPath();
      this.fallback.strokePath();
    } else if (presentation.silhouette === 'double-round') {
      this.fallback.fillCircle(size * 0.35, size * 0.58, radius * 0.82);
      this.fallback.fillCircle(size * 0.67, size * 0.58, radius * 0.82);
      this.fallback.strokeCircle(size * 0.35, size * 0.58, radius * 0.82);
      this.fallback.strokeCircle(size * 0.67, size * 0.58, radius * 0.82);
    } else {
      for (const [x, y] of [
        [0.36, 0.37],
        [0.64, 0.37],
        [0.28, 0.61],
        [0.5, 0.58],
        [0.72, 0.61],
        [0.42, 0.79],
        [0.61, 0.79],
      ] as const) {
        this.fallback.fillCircle(size * x, size * y, radius * 0.43);
      }
    }

    this.fallback.fillStyle(0xffffff, 0.42);
    this.fallback.fillEllipse(size * 0.38, size * 0.36, size * 0.2, size * 0.1);
  }

  private drawSpecialOverlay(size: number): void {
    if (!this.specialKind) {
      return;
    }

    const center = size / 2;
    const cream = 0xfff6df;

    if (this.specialKind === 'line_horizontal') {
      this.specialOverlay.fillStyle(cream, 0.9);
      this.specialOverlay.fillRoundedRect(
        size * 0.08,
        center - size * 0.09,
        size * 0.84,
        size * 0.18,
        size * 0.09,
      );
      this.specialOverlay.lineStyle(2, 0xffffff, 0.96);
      this.specialOverlay.lineBetween(size * 0.13, center, size * 0.87, center);
      this.drawDirectionalSparkles(size, 'horizontal');
      return;
    }

    if (this.specialKind === 'line_vertical') {
      this.specialOverlay.fillStyle(cream, 0.9);
      this.specialOverlay.fillRoundedRect(
        center - size * 0.09,
        size * 0.08,
        size * 0.18,
        size * 0.84,
        size * 0.09,
      );
      this.specialOverlay.lineStyle(2, 0xffffff, 0.96);
      this.specialOverlay.lineBetween(center, size * 0.13, center, size * 0.87);
      this.drawDirectionalSparkles(size, 'vertical');
      return;
    }

    if (this.specialKind === 'bomb') {
      this.specialOverlay.lineStyle(3, 0xfff7df, 0.98);
      this.specialOverlay.strokeCircle(center, center, size * 0.38);
      this.specialOverlay.lineStyle(2, 0xf4bd55, 0.92);
      this.specialOverlay.strokeCircle(center, center, size * 0.3);
      for (const [x, y] of [
        [0.17, 0.24],
        [0.81, 0.2],
        [0.84, 0.76],
        [0.18, 0.78],
      ] as const) {
        this.specialOverlay.fillStyle(0xfff1b7, 0.96);
        this.specialOverlay.fillCircle(size * x, size * y, Math.max(2, size * 0.055));
      }
      return;
    }

    this.specialOverlay.fillStyle(0xffffff, 0.82);
    this.specialOverlay.fillCircle(center, center, size * 0.24);
    for (const [color, radius, start] of [
      [0xf184a5, 0.34, 0.08],
      [0xf2c35d, 0.3, 0.58],
      [0xa695e8, 0.26, 1.08],
      [0x78cbb5, 0.22, 1.58],
    ] as const) {
      this.specialOverlay.lineStyle(3, color, 0.95);
      this.specialOverlay.beginPath();
      this.specialOverlay.arc(
        center,
        center,
        size * radius,
        Math.PI * start,
        Math.PI * (start + 0.68),
      );
      this.specialOverlay.strokePath();
    }
  }

  private drawDirectionalSparkles(size: number, direction: 'horizontal' | 'vertical'): void {
    const points =
      direction === 'horizontal'
        ? [
            [0.1, 0.5],
            [0.9, 0.5],
          ]
        : [
            [0.5, 0.1],
            [0.5, 0.9],
          ];
    for (const [x, y] of points) {
      const radius = Math.max(2, size * 0.06);
      this.specialOverlay.lineStyle(2, 0xffffff, 1);
      this.specialOverlay.lineBetween(size * x - radius, size * y, size * x + radius, size * y);
      this.specialOverlay.lineBetween(size * x, size * y - radius, size * x, size * y + radius);
    }
  }

  setScenePosition(row: number, col: number, metrics: BoardLayoutMetrics): void {
    const position = TileView.toScenePosition(row, col, metrics);
    this.container.setPosition(position.x, position.y);
  }

  static toScenePosition(
    row: number,
    col: number,
    metrics: BoardLayoutMetrics,
  ): { x: number; y: number } {
    return {
      x: metrics.originX + metrics.gap + col * (metrics.tileSize + metrics.gap),
      y: metrics.originY + metrics.gap + row * (metrics.tileSize + metrics.gap),
    };
  }

  playPop(): Promise<void> {
    if (this.selectedTween) {
      this.selectedTween.stop();
      this.selectedTween = null;
    }
    this.selection.setVisible(false);
    this.berryLayer.setScale(1);

    const shrinkDuration = this.specialKind ? 150 : 130;
    const center = this.currentTileSize / 2;
    const burstTween = playPopBurstEffect(this.scene, {
      x: this.container.x + center,
      y: this.container.y + center,
      size: this.currentTileSize,
      kind: this.kind,
      specialKind: this.specialKind,
    });

    const tileTween = new Promise<void>((resolve) => {
      this.container.setDepth(this.specialKind ? GAME_DEPTH.pop + 1 : GAME_DEPTH.pop);
      this.container.setScale(1).setAlpha(1);
      this.scene.tweens.add({
        targets: this.container,
        scaleX: this.specialKind ? 1.14 : 1.1,
        scaleY: this.specialKind ? 0.94 : 0.96,
        duration: 70,
        ease: 'Sine.easeOut',
        onComplete: () => {
          this.scene.tweens.add({
            targets: this.container,
            scale: 0.08,
            alpha: 0,
            duration: shrinkDuration,
            ease: 'Back.easeIn',
            onComplete: () => resolve(),
          });
        },
      });
    });

    return Promise.all([burstTween, tileTween]).then(() => undefined);
  }

  destroy(): void {
    if (this.selectedTween) {
      this.selectedTween.stop();
      this.selectedTween = null;
    }
    this.container.destroy(true);
  }
}
