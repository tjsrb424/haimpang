export interface CouponData {
  id: string;
  title: string;
  description: string;
  unlockCondition: string;
  qrPayload: string;
}

export const coupons: CouponData[] = [
  {
    id: 'coffee',
    title: '커피 쿠폰',
    description: '오늘 마시고 싶은 커피 한 잔.',
    unlockCondition: '스테이지 1 클리어',
    qrPayload: 'HAIMPANG:COFFEE:001',
  },
  {
    id: 'meal',
    title: '밥 사주기 쿠폰',
    description: '먹고 싶은 메뉴를 고르는 날.',
    unlockCondition: '별 20개 모으기',
    qrPayload: 'HAIMPANG:MEAL:001',
  },
  {
    id: 'massage',
    title: '마사지 쿠폰',
    description: '피곤한 날에 쓰는 편안한 쿠폰.',
    unlockCondition: '5스테이지 클리어',
    qrPayload: 'HAIMPANG:MASSAGE:001',
  },
  {
    id: 'wish',
    title: '소원 하나 쿠폰',
    description: '작은 부탁 하나를 들어주는 쿠폰.',
    unlockCondition: '첫 3연쇄 달성',
    qrPayload: 'HAIMPANG:WISH:001',
  },
  {
    id: 'date-choice',
    title: '데이트 선택권',
    description: '다음 데이트 코스를 직접 고르기.',
    unlockCondition: '추억 로그 5개',
    qrPayload: 'HAIMPANG:DATE:001',
  },
  {
    id: 'kiss',
    title: '뽀뽀 쿠폰',
    description: '귀엽게 바로 쓰는 보너스 쿠폰.',
    unlockCondition: '별 100개 모으기',
    qrPayload: 'HAIMPANG:KISS:001',
  },
];
