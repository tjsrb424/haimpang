import Phaser from 'phaser';
import type { BoardTile, SpecialTileKind, TileKind } from '../../core/types';
import type { BoardLayoutMetrics } from '../../input/pointerToTile';
import { getTileStyleByKind } from '../../ui/tileFactory';

export class TileView {
  tileId: string;
  kind: TileKind;
  specialKind?: SpecialTileKind;
  row: number;
  col: number;
  container: Phaser.GameObjects.Container;

  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private selection: Phaser.GameObjects.Graphics;
  private selectedTween: Phaser.Tweens.Tween | null = null;
  private currentTileSize = 40;

  constructor(scene: Phaser.Scene, tile: BoardTile, metrics: BoardLayoutMetrics, spawnRow = tile.position.row) {
    this.scene = scene;
    this.tileId = tile.id;
    this.kind = tile.kind;
    this.specialKind = tile.specialKind;
    this.row = tile.position.row;
    this.col = tile.position.col;
    this.graphics = scene.add.graphics();
    this.selection = scene.add.graphics();
    this.label = scene.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif',
      fontStyle: '900',
    });
    this.container = scene.add.container(0, 0, [this.selection, this.graphics, this.label]);
    this.container.setDepth(3);
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

    this.container.setScale(1);
    if (selected) {
      this.selectedTween = this.scene.tweens.add({
        targets: this.selection,
        alpha: { from: 0.45, to: 0.9 },
        duration: 760,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  redraw(metrics: BoardLayoutMetrics): void {
    const style = getTileStyleByKind(this.kind);
    const radius = Math.max(10, metrics.tileSize * 0.25);

    this.currentTileSize = metrics.tileSize;
    this.graphics.clear();
    this.selection.clear();

    this.selection.lineStyle(3, 0xffffff, 0.86);
    this.selection.strokeRoundedRect(-3, -3, metrics.tileSize + 6, metrics.tileSize + 6, radius + 3);
    this.selection.lineStyle(2, style.stroke, 0.78);
    this.selection.strokeRoundedRect(-6, -6, metrics.tileSize + 12, metrics.tileSize + 12, radius + 6);
    this.selection.setVisible(false);

    this.graphics.fillStyle(style.shadow, 0.15);
    this.graphics.fillRoundedRect(2, 4, metrics.tileSize, metrics.tileSize, radius);
    this.graphics.fillStyle(style.fill, 1);

    if (style.shape === 'circle') {
      this.graphics.fillCircle(metrics.tileSize / 2, metrics.tileSize / 2, metrics.tileSize * 0.46);
    } else if (style.shape === 'diamond') {
      this.graphics.beginPath();
      this.graphics.moveTo(metrics.tileSize / 2, 2);
      this.graphics.lineTo(metrics.tileSize - 2, metrics.tileSize / 2);
      this.graphics.lineTo(metrics.tileSize / 2, metrics.tileSize - 2);
      this.graphics.lineTo(2, metrics.tileSize / 2);
      this.graphics.closePath();
      this.graphics.fillPath();
    } else if (style.shape === 'pill') {
      this.graphics.fillRoundedRect(2, metrics.tileSize * 0.12, metrics.tileSize - 4, metrics.tileSize * 0.76, metrics.tileSize * 0.38);
    } else {
      this.graphics.fillRoundedRect(0, 0, metrics.tileSize, metrics.tileSize, radius);
    }

    this.graphics.lineStyle(2, style.stroke, 0.52);
    this.graphics.strokeRoundedRect(1, 1, metrics.tileSize - 2, metrics.tileSize - 2, radius);
    this.graphics.fillStyle(0xffffff, 0.24);
    this.graphics.fillCircle(metrics.tileSize * 0.32, metrics.tileSize * 0.26, Math.max(2, metrics.tileSize * 0.09));
    this.drawSpecialOverlay(metrics);

    this.label.setText(style.label);
    this.label.setStyle({
      fontSize: `${Math.max(12, metrics.tileSize * 0.3)}px`,
      color: style.text,
    });
    this.label.setOrigin(0.5);
    this.label.setPosition(metrics.tileSize / 2, metrics.tileSize / 2);
    this.container.setSize(metrics.tileSize, metrics.tileSize);
  }

  private drawSpecialOverlay(metrics: BoardLayoutMetrics): void {
    if (!this.specialKind) {
      return;
    }

    const size = metrics.tileSize;
    const center = size / 2;

    if (this.specialKind === 'line_horizontal') {
      this.graphics.fillStyle(0xffffff, 0.78);
      this.graphics.fillRoundedRect(size * 0.14, center - size * 0.09, size * 0.72, size * 0.18, size * 0.09);
      this.graphics.lineStyle(2, 0xff7197, 0.74);
      this.graphics.lineBetween(size * 0.2, center, size * 0.8, center);
      return;
    }

    if (this.specialKind === 'line_vertical') {
      this.graphics.fillStyle(0xffffff, 0.78);
      this.graphics.fillRoundedRect(center - size * 0.09, size * 0.14, size * 0.18, size * 0.72, size * 0.09);
      this.graphics.lineStyle(2, 0xff7197, 0.74);
      this.graphics.lineBetween(center, size * 0.2, center, size * 0.8);
      return;
    }

    if (this.specialKind === 'bomb') {
      this.graphics.lineStyle(3, 0xffffff, 0.85);
      this.graphics.strokeCircle(center, center, size * 0.28);
      this.graphics.lineStyle(2, 0xffd166, 0.9);
      this.graphics.strokeCircle(center, center, size * 0.2);
      for (const [x, y] of [
        [0.28, 0.24],
        [0.74, 0.28],
        [0.72, 0.72],
        [0.26, 0.7],
      ] as const) {
        this.graphics.fillStyle(0xffffff, 0.9);
        this.graphics.fillCircle(size * x, size * y, Math.max(1.5, size * 0.035));
      }
      return;
    }

    this.graphics.lineStyle(3, 0xffffff, 0.88);
    this.graphics.strokeCircle(center, center, size * 0.32);
    for (const [color, offset] of [
      [0xff7197, -0.12],
      [0xffd166, 0],
      [0x65c7b4, 0.12],
    ] as const) {
      this.graphics.lineStyle(2, color, 0.9);
      this.graphics.beginPath();
      this.graphics.arc(center, center + size * offset, size * 0.22, Math.PI * 0.08, Math.PI * 0.92);
      this.graphics.strokePath();
    }
  }

  setScenePosition(row: number, col: number, metrics: BoardLayoutMetrics): void {
    const position = TileView.toScenePosition(row, col, metrics);
    this.container.setPosition(position.x, position.y);
  }

  static toScenePosition(row: number, col: number, metrics: BoardLayoutMetrics): { x: number; y: number } {
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

    const burst = this.createPopBurst();
    const burstDuration = this.specialKind ? 270 : 230;
    const shrinkDuration = this.specialKind ? 150 : 130;

    const burstTween = new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: burst,
        scale: { from: 0.72, to: this.specialKind ? 1.28 : 1.12 },
        alpha: { from: 0.96, to: 0 },
        duration: burstDuration,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          burst.destroy();
          resolve();
        },
      });
    });

    const tileTween = new Promise<void>((resolve) => {
      this.container.setDepth(this.specialKind ? 9 : 8);
      this.container.setScale(1);
      this.container.setAlpha(1);
      this.scene.tweens.add({
        targets: this.container,
        scale: this.specialKind ? 1.12 : 1.08,
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

  private createPopBurst(): Phaser.GameObjects.Graphics {
    const style = getTileStyleByKind(this.kind);
    const size = this.currentTileSize;
    const center = size / 2;
    const radius = size * (this.specialKind ? 0.74 : 0.56);
    const dotCount = this.specialKind ? 10 : 6;
    const rayCount = this.specialKind ? 8 : 4;
    const graphics = this.scene.add.graphics();

    graphics.setDepth(this.specialKind ? 14 : 10);
    graphics.setPosition(this.container.x + center, this.container.y + center);
    graphics.lineStyle(this.specialKind ? 3 : 2, 0xffffff, this.specialKind ? 0.82 : 0.66);
    graphics.strokeCircle(0, 0, radius * 0.44);
    graphics.lineStyle(2, style.stroke, this.specialKind ? 0.58 : 0.4);
    graphics.strokeCircle(0, 0, radius * 0.72);

    for (let index = 0; index < rayCount; index += 1) {
      const angle = (Math.PI * 2 * index) / rayCount + 0.18;
      const inner = radius * 0.36;
      const outer = radius * (this.specialKind ? 1.06 : 0.92);

      graphics.lineStyle(this.specialKind ? 3 : 2, index % 2 === 0 ? 0xfffbef : style.fill, 0.62);
      graphics.lineBetween(
        Math.cos(angle) * inner,
        Math.sin(angle) * inner,
        Math.cos(angle) * outer,
        Math.sin(angle) * outer,
      );
    }

    for (let index = 0; index < dotCount; index += 1) {
      const angle = (Math.PI * 2 * index) / dotCount + (this.specialKind ? 0.1 : 0.32);
      const distance = radius * (0.72 + (index % 3) * 0.12);
      const dotRadius = Math.max(2, size * (this.specialKind && index % 2 === 0 ? 0.09 : 0.065));
      const color = index % 3 === 0 ? 0xfffbef : index % 2 === 0 ? style.fill : style.stroke;

      graphics.fillStyle(color, index % 3 === 0 ? 0.95 : 0.78);
      graphics.fillCircle(Math.cos(angle) * distance, Math.sin(angle) * distance, dotRadius);
    }

    return graphics;
  }

  destroy(): void {
    if (this.selectedTween) {
      this.selectedTween.stop();
      this.selectedTween = null;
    }
    this.container.destroy(true);
  }
}
