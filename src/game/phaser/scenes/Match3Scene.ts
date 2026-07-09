import Phaser from 'phaser';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../../core/board';
import { getTileStyle } from '../../ui/tileFactory';

export class Match3Scene extends Phaser.Scene {
  constructor() {
    super('Match3Scene');
  }

  create() {
    this.drawBoard();
    this.scale.on('resize', this.drawBoard, this);
  }

  shutdown() {
    this.scale.off('resize', this.drawBoard, this);
  }

  private drawBoard() {
    this.children.removeAll(true);

    const width = this.scale.width;
    const height = this.scale.height;
    const maxBoardWidth = Math.min(width * 0.92, 430);
    const maxBoardHeight = height * 0.74;
    const boardSize = Math.floor(Math.min(maxBoardWidth, maxBoardHeight));
    const gap = Math.max(4, Math.floor(boardSize * 0.012));
    const tileSize = Math.floor((boardSize - gap * (BOARD_WIDTH + 1)) / BOARD_WIDTH);
    const originX = Math.round((width - boardSize) / 2);
    const originY = Math.round((height - boardSize) / 2 + 12);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.84);
    bg.fillRoundedRect(originX, originY, boardSize, boardSize, 28);
    bg.lineStyle(2, 0xffb5c8, 0.55);
    bg.strokeRoundedRect(originX + 1, originY + 1, boardSize - 2, boardSize - 2, 28);

    const title = this.add
      .text(width / 2, Math.max(18, originY - 42), 'SPRINT 0 PHASER BOARD', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#7f4157',
        fontStyle: '700',
      })
      .setOrigin(0.5);

    title.setAlpha(0.72);

    for (let row = 0; row < BOARD_HEIGHT; row += 1) {
      for (let col = 0; col < BOARD_WIDTH; col += 1) {
        const style = getTileStyle(row * BOARD_WIDTH + col);
        const x = originX + gap + col * (tileSize + gap);
        const y = originY + gap + row * (tileSize + gap);
        const tile = this.add.graphics();

        tile.fillStyle(style.shadow, 0.18);
        tile.fillRoundedRect(x + 2, y + 4, tileSize, tileSize, Math.max(10, tileSize * 0.24));
        tile.fillStyle(style.fill, 1);
        tile.fillRoundedRect(x, y, tileSize, tileSize, Math.max(10, tileSize * 0.24));
        tile.lineStyle(2, style.stroke, 0.6);
        tile.strokeRoundedRect(x + 1, y + 1, tileSize - 2, tileSize - 2, Math.max(10, tileSize * 0.24));

        this.add
          .text(x + tileSize / 2, y + tileSize / 2, style.label, {
            fontFamily: 'Arial, sans-serif',
            fontSize: `${Math.max(13, tileSize * 0.34)}px`,
            color: style.text,
            fontStyle: '800',
          })
          .setOrigin(0.5);
      }
    }

    const footer = this.add
      .text(width / 2, Math.min(height - 18, originY + boardSize + 28), 'core engine arrives in Sprint 1', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#8b6575',
      })
      .setOrigin(0.5);

    footer.setAlpha(0.8);
  }
}
