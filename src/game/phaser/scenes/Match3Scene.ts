import Phaser from 'phaser';
import { createInitialBoard } from '../../core/board';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../../core/board';
import type { BoardGrid } from '../../core/types';
import { getTileStyleByKind } from '../../ui/tileFactory';

const PREVIEW_SEED = 'haimpang-sprint2-preview';

export class Match3Scene extends Phaser.Scene {
  private previewBoard: BoardGrid | null = null;

  constructor() {
    super('Match3Scene');
  }

  create() {
    this.previewBoard = createInitialBoard({ seed: PREVIEW_SEED });
    this.drawBoard();
    this.scale.on('resize', this.drawBoard, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.drawBoard, this);
    });
  }

  private drawBoard() {
    this.children.removeAll(true);

    const width = this.scale.width;
    const height = this.scale.height;
    const boardSize = Math.floor(Math.min(width * 0.96, height * 0.96, 402));
    const gap = Math.max(5, Math.floor(boardSize * 0.014));
    const tileSize = Math.floor((boardSize - gap * (BOARD_WIDTH + 1)) / BOARD_WIDTH);
    const actualBoardSize = tileSize * BOARD_WIDTH + gap * (BOARD_WIDTH + 1);
    const originX = Math.round((width - actualBoardSize) / 2);
    const originY = Math.round((height - actualBoardSize) / 2);

    this.drawBackground(width, height);
    this.drawBoardFrame(originX, originY, actualBoardSize);
    this.drawTiles(originX, originY, tileSize, gap);
  }

  private drawBackground(width: number, height: number) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xfffbf7, 0xfffbf7, 0xffeef4, 0xfff3ec, 1);
    bg.fillRect(0, 0, width, height);

    bg.fillStyle(0xff7197, 0.11);
    bg.fillCircle(width * 0.16, height * 0.16, Math.min(width, height) * 0.18);
    bg.fillStyle(0x8f7cf7, 0.1);
    bg.fillCircle(width * 0.9, height * 0.2, Math.min(width, height) * 0.2);
    bg.fillStyle(0x65c7b4, 0.09);
    bg.fillCircle(width * 0.12, height * 0.9, Math.min(width, height) * 0.16);

    for (let index = 0; index < 11; index += 1) {
      const x = (width * ((index * 37) % 100)) / 100;
      const y = (height * ((index * 53 + 17) % 100)) / 100;
      bg.fillStyle(index % 2 === 0 ? 0xffd36a : 0xffffff, 0.2);
      bg.fillCircle(x, y, index % 3 === 0 ? 3 : 2);
    }
  }

  private drawBoardFrame(originX: number, originY: number, boardSize: number) {
    const frame = this.add.graphics();
    frame.fillStyle(0xffffff, 0.72);
    frame.fillRoundedRect(originX - 10, originY - 10, boardSize + 20, boardSize + 20, 24);
    frame.lineStyle(2, 0xffb6c8, 0.55);
    frame.strokeRoundedRect(originX - 9, originY - 9, boardSize + 18, boardSize + 18, 24);

    frame.fillStyle(0xfff0f4, 0.74);
    frame.fillRoundedRect(originX, originY, boardSize, boardSize, 18);
  }

  private drawTiles(originX: number, originY: number, tileSize: number, gap: number) {
    for (let row = 0; row < BOARD_HEIGHT; row += 1) {
      for (let col = 0; col < BOARD_WIDTH; col += 1) {
        const kind = this.previewBoard?.[row]?.[col]?.kind ?? 'heart';
        const style = getTileStyleByKind(kind);
        const x = originX + gap + col * (tileSize + gap);
        const y = originY + gap + row * (tileSize + gap);
        const tile = this.add.graphics();
        const radius = Math.max(10, tileSize * 0.25);

        tile.fillStyle(style.shadow, 0.15);
        tile.fillRoundedRect(x + 2, y + 4, tileSize, tileSize, radius);
        tile.fillStyle(style.fill, 1);

        if (style.shape === 'circle') {
          tile.fillCircle(x + tileSize / 2, y + tileSize / 2, tileSize * 0.46);
        } else if (style.shape === 'diamond') {
          tile.beginPath();
          tile.moveTo(x + tileSize / 2, y + 2);
          tile.lineTo(x + tileSize - 2, y + tileSize / 2);
          tile.lineTo(x + tileSize / 2, y + tileSize - 2);
          tile.lineTo(x + 2, y + tileSize / 2);
          tile.closePath();
          tile.fillPath();
        } else if (style.shape === 'pill') {
          tile.fillRoundedRect(x + 2, y + tileSize * 0.12, tileSize - 4, tileSize * 0.76, tileSize * 0.38);
        } else {
          tile.fillRoundedRect(x, y, tileSize, tileSize, radius);
        }

        tile.lineStyle(2, style.stroke, 0.52);
        tile.strokeRoundedRect(x + 1, y + 1, tileSize - 2, tileSize - 2, radius);
        tile.fillStyle(0xffffff, 0.24);
        tile.fillCircle(x + tileSize * 0.32, y + tileSize * 0.26, Math.max(2, tileSize * 0.09));

        this.add
          .text(x + tileSize / 2, y + tileSize / 2, style.label, {
            fontFamily: 'Arial, sans-serif',
            fontSize: `${Math.max(12, tileSize * 0.3)}px`,
            color: style.text,
            fontStyle: '900',
          })
          .setOrigin(0.5);
      }
    }
  }
}
