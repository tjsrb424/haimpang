const stageNames: Record<number, string> = {
  1: '첫 번째 선물 상자',
  2: '딸기 바구니',
  3: '체리 주머니',
  4: '베리 한가득',
  5: '작은 연쇄',
  6: '리본 한 줄',
  7: '선물 리본',
  8: '점심 힌트',
  9: '민트 발걸음',
  10: '반짝 믹스',
  11: '복숭아빛 계획',
  12: '쉬어가기 쿠폰',
  13: '느긋한 시계',
  14: '선물 더미',
  15: '빛나는 주머니',
  16: '데이트 선택',
  17: '라벤더 달리기',
  18: '리본 러시',
  19: '거의 다 왔어요',
  20: '작은 쪽쪽',
};

export function getStageDisplayName(stageId: number): string {
  return stageNames[stageId] ?? `선물 ${stageId}`;
}

export function formatStageNumber(stageId: number): string {
  return `스테이지 ${String(stageId).padStart(2, '0')}`;
}
