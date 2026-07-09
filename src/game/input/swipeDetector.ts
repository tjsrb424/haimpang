export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeResult {
  direction: SwipeDirection | null;
  distance: number;
  reason: 'confirmed' | 'below-threshold' | 'ambiguous';
}

export function detectSwipeDirection({
  startX,
  startY,
  currentX,
  currentY,
  tileSize,
}: {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  tileSize: number;
}): SwipeResult {
  const dx = currentX - startX;
  const dy = currentY - startY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  const dominant = Math.max(absX, absY);
  const secondary = Math.min(absX, absY);
  const threshold = Math.max(14, tileSize * 0.22);

  if (dominant < threshold) {
    return { direction: null, distance: dominant, reason: 'below-threshold' };
  }

  if (dominant < secondary * 1.25) {
    return { direction: null, distance: dominant, reason: 'ambiguous' };
  }

  if (absX > absY) {
    return { direction: dx > 0 ? 'right' : 'left', distance: dominant, reason: 'confirmed' };
  }

  return { direction: dy > 0 ? 'down' : 'up', distance: dominant, reason: 'confirmed' };
}

export function detectSwipe(dx: number, dy: number, tileSize: number): SwipeResult {
  return detectSwipeDirection({
    startX: 0,
    startY: 0,
    currentX: dx,
    currentY: dy,
    tileSize,
  });
}
