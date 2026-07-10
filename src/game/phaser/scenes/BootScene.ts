import Phaser from 'phaser';
import { TILE_PRESENTATION_LIST } from '../../presentation/tilePresentation';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    for (const presentation of TILE_PRESENTATION_LIST) {
      this.load.svg(presentation.textureKey, presentation.assetPath, {
        width: 128,
        height: 128,
      });
    }
  }

  create() {
    this.scene.start('Match3Scene');
  }
}
