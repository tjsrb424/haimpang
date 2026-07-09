interface TileStyle {
  fill: number;
  stroke: number;
  shadow: number;
  text: string;
  label: string;
}

const tileStyles: TileStyle[] = [
  { fill: 0xff87a8, stroke: 0xff5d8a, shadow: 0x74344b, text: '#ffffff', label: 'H' },
  { fill: 0xffd166, stroke: 0xf8ad2f, shadow: 0x7a581f, text: '#5b3b0c', label: 'S' },
  { fill: 0xb7a6ff, stroke: 0x8f78ff, shadow: 0x443778, text: '#ffffff', label: 'F' },
  { fill: 0x7fd8c4, stroke: 0x4dbda7, shadow: 0x236356, text: '#123f38', label: 'C' },
  { fill: 0xff9f7b, stroke: 0xf47759, shadow: 0x813a2c, text: '#ffffff', label: 'G' },
];

export function getTileStyle(index: number): TileStyle {
  return tileStyles[index % tileStyles.length];
}
