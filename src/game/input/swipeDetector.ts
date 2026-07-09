export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeResult {
  direction: SwipeDirection | null;
  distance: number;
  reason: 'accepted' | 'below_threshold' | 'ambiguous';
}

export function detectSwipe(
  dx: number,
  dy: number,
  tileSize: number,
  ratioThreshold = 1.25,
): SwipeResult {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  const dominant = Math.max(absX, absY);
  const secondary = Math.min(absX, absY);
  const threshold = Math.max(14, tileSize * 0.22);

  if (dominant < threshold) {
    return { direction: null, distance: dominant, reason: 'below_threshold' };
  }

  if (secondary > 0 && dominant < secondary * ratioThreshold) {
    return { direction: null, distance: dominant, reason: 'ambiguous' };
  }

  if (absX > absY) {
    return { direction: dx > 0 ? 'right' : 'left', distance: dominant, reason: 'accepted' };
  }

  return { direction: dy > 0 ? 'down' : 'up', distance: dominant, reason: 'accepted' };
}
