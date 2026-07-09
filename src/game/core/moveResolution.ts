import { cloneBoard, getTile } from './board';
import { resolveCascade } from './cascade';
import { resolveSpecialActivations } from './special';
import { areAdjacent, swapTiles, trySwap } from './swap';
import type { BoardGrid, MoveResolution, SwapMove, TileKind } from './types';

interface ResolveMoveOptions {
  seed: string | number;
  tileKinds?: TileKind[];
}

function emptyResolution(board: BoardGrid): MoveResolution {
  const stableBoard = cloneBoard(board);

  return {
    valid: false,
    board: stableBoard,
    swappedBoard: stableBoard,
    cascade: {
      finalBoard: stableBoard,
      steps: [],
      totalRemoved: 0,
    },
    specialCreations: [],
    specialActivations: [],
  };
}

export function resolveMoveWithSpecials(
  board: BoardGrid,
  move: SwapMove,
  { seed, tileKinds }: ResolveMoveOptions,
): MoveResolution {
  const fromTile = getTile(board, move.from);
  const toTile = getTile(board, move.to);

  if (!fromTile || !toTile || !areAdjacent(move.from, move.to)) {
    return emptyResolution(board);
  }

  const hasSpecialSwap = Boolean(fromTile.specialKind || toTile.specialKind);
  const swappedBoard = swapTiles(board, move);

  if (hasSpecialSwap) {
    const fromAfter = getTile(swappedBoard, move.to);
    const toAfter = getTile(swappedBoard, move.from);
    const targetKind = fromAfter?.specialKind === 'rainbow' ? toAfter?.kind : fromAfter?.kind;
    const activationPositions = [
      ...(fromAfter?.specialKind ? [move.to] : []),
      ...(toAfter?.specialKind ? [move.from] : []),
    ];
    const specialActivations = resolveSpecialActivations(
      swappedBoard,
      activationPositions,
      'swapped',
      targetKind,
    );
    const cascade = resolveCascade(swappedBoard, {
      seed,
      tileKinds,
      initialActivations: specialActivations,
      preferredPositions: [move.to, move.from],
    });

    return {
      valid: true,
      board: cascade.finalBoard,
      swappedBoard,
      cascade,
      specialCreations: cascade.steps.flatMap((step) => step.specialCreations),
      specialActivations: cascade.steps.flatMap((step) => step.specialActivations),
    };
  }

  const swapResult = trySwap(board, move);
  if (!swapResult.valid) {
    return emptyResolution(board);
  }

  const cascade = resolveCascade(swapResult.board, {
    seed,
    tileKinds,
    preferredPositions: [move.to, move.from],
  });

  return {
    valid: true,
    board: cascade.finalBoard,
    swappedBoard: swapResult.board,
    cascade,
    specialCreations: cascade.steps.flatMap((step) => step.specialCreations),
    specialActivations: cascade.steps.flatMap((step) => step.specialActivations),
  };
}
