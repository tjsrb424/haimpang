interface TileStyle {
  fill: number;
  stroke: number;
  shadow: number;
  text: string;
  label: string;
  shape: 'rounded' | 'circle' | 'diamond' | 'squircle' | 'pill';
}

const tileStyles: TileStyle[] = [
  { fill: 0xff7fa6, stroke: 0xf45c8b, shadow: 0x8b3651, text: '#ffffff', label: 'H', shape: 'rounded' },
  { fill: 0xffd36a, stroke: 0xf1a82c, shadow: 0x765a1c, text: '#62420d', label: 'S', shape: 'circle' },
  { fill: 0xb9a8ff, stroke: 0x8d77f4, shadow: 0x4b3d87, text: '#ffffff', label: 'F', shape: 'diamond' },
  { fill: 0x75d2bd, stroke: 0x45b5a0, shadow: 0x28685d, text: '#184840', label: 'C', shape: 'squircle' },
  { fill: 0xffa27f, stroke: 0xef7357, shadow: 0x873e2f, text: '#ffffff', label: 'G', shape: 'pill' },
];

export function getTileStyle(index: number): TileStyle {
  return tileStyles[index % tileStyles.length];
}
