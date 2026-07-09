import Phaser from 'phaser';
import type { BoardTile, TileKind } from '../../core/types';
import type { BoardLayoutMetrics } from '../../input/pointerToTile';
import { getTileStyleByKind } from '../../ui/tileFactory';

export class TileView {
  tileId: string;
  kind: TileKind;
  row: number;
  col: number;
  container: Phaser.GameObjects.Container;

  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private selection: Phaser.GameObjects.Graphics;
  private selectedTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, tile: BoardTile, metrics: BoardLayoutMetrics, spawnRow = tile.position.row) {
    this.scene = scene;
    this.tileId = tile.id;
    this.kind = tile.kind;
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

    this.label.setText(style.label);
    this.label.setStyle({
      fontSize: `${Math.max(12, metrics.tileSize * 0.3)}px`,
      color: style.text,
    });
    this.label.setOrigin(0.5);
    this.label.setPosition(metrics.tileSize / 2, metrics.tileSize / 2);
    this.container.setSize(metrics.tileSize, metrics.tileSize);
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
    return new Promise((resolve) => {
      this.container.setDepth(8);
      this.scene.tweens.add({
        targets: this.container,
        scale: 0.1,
        alpha: 0,
        duration: 120,
        ease: 'Back.easeIn',
        onComplete: () => resolve(),
      });
    });
  }

  destroy(): void {
    if (this.selectedTween) {
      this.selectedTween.stop();
      this.selectedTween = null;
    }
    this.container.destroy(true);
  }
}
