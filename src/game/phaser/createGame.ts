import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { Match3Scene, type Match3SceneOptions } from './scenes/Match3Scene';
import { ResultScene } from './scenes/ResultScene';

export function createGame(parent: HTMLElement, options: Match3SceneOptions = {}): Phaser.Game {
  const width = Math.max(parent.clientWidth, 320);
  const height = Math.max(parent.clientHeight, 420);

  const config: Phaser.Types.Core.GameConfig & { resolution: number } = {
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: '#fff6f6',
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width,
      height,
    },
    scene: [BootScene, new Match3Scene(options), ResultScene],
  };

  return new Phaser.Game(config);
}
