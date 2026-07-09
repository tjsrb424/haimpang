export type CouponCategory = 'food' | 'date' | 'care' | 'wish' | 'special';

export interface CouponDefinition {
  id: string;
  title: string;
  description: string;
  unlockCondition: string;
  qrPayload: string;
  category: CouponCategory;
  displayCode: string;
  useConfirmText: string;
  memoryTitle: string;
  memoryDescription: string;
}

export const coupons: CouponDefinition[] = [
  {
    id: 'coffee',
    title: '커피 쿠폰',
    description: '마시고 싶은 날 바로 꺼내는 작은 커피 선물.',
    unlockCondition: 'Stage 1 클리어',
    qrPayload: 'HAIMPANG:COFFEE:001',
    category: 'food',
    displayCode: 'HP-COFFEE-001',
    useConfirmText: '커피를 받은 뒤에만 사용 완료로 바꿔 주세요.',
    memoryTitle: '커피 쿠폰 사용',
    memoryDescription: '커피 쿠폰 하나가 실제 커피 시간으로 바뀌었어요.',
  },
  {
    id: 'meal',
    title: '밥 사주기 쿠폰',
    description: '먹고 싶은 메뉴를 고르면 선규가 사주는 쿠폰.',
    unlockCondition: 'Stage 8 클리어',
    qrPayload: 'HAIMPANG:MEAL:001',
    category: 'food',
    displayCode: 'HP-MEAL-001',
    useConfirmText: '식사가 끝난 뒤에 사용 완료로 바꿔 주세요.',
    memoryTitle: '밥 사주기 쿠폰 사용',
    memoryDescription: '밥 사주기 쿠폰이 맛있는 한 끼로 남았어요.',
  },
  {
    id: 'massage',
    title: '마사지 쿠폰',
    description: '피곤한 날 조용히 꺼내는 어깨 케어 쿠폰.',
    unlockCondition: 'Stage 12 클리어',
    qrPayload: 'HAIMPANG:MASSAGE:001',
    category: 'care',
    displayCode: 'HP-CARE-001',
    useConfirmText: '마사지가 끝난 뒤에 사용 완료로 바꿔 주세요.',
    memoryTitle: '마사지 쿠폰 사용',
    memoryDescription: '마사지 쿠폰이 다정한 휴식으로 기록됐어요.',
  },
  {
    id: 'wish',
    title: '소원 하나 쿠폰',
    description: '부담스럽지 않은 작은 소원 하나를 들어주는 쿠폰.',
    unlockCondition: 'Stage 5 클리어',
    qrPayload: 'HAIMPANG:WISH:001',
    category: 'wish',
    displayCode: 'HP-WISH-001',
    useConfirmText: '소원이 실제로 이루어진 뒤에 사용 완료로 바꿔 주세요.',
    memoryTitle: '소원 쿠폰 사용',
    memoryDescription: '작은 소원 하나가 하임팡 추억에 저장됐어요.',
  },
  {
    id: 'date-choice',
    title: '데이트 선택권',
    description: '다음 데이트 코스를 효임이 직접 고르는 쿠폰.',
    unlockCondition: 'Stage 16 클리어',
    qrPayload: 'HAIMPANG:DATE:001',
    category: 'date',
    displayCode: 'HP-DATE-001',
    useConfirmText: '데이트 선택이 확정된 뒤에 사용 완료로 바꿔 주세요.',
    memoryTitle: '데이트 선택권 사용',
    memoryDescription: '데이트 선택권이 다음 약속으로 이어졌어요.',
  },
  {
    id: 'kiss',
    title: '쪽쪽 쿠폰',
    description: '짧고 귀엽게 꺼내 쓰는 특별 보너스.',
    unlockCondition: 'Stage 20 클리어',
    qrPayload: 'HAIMPANG:KISS:001',
    category: 'special',
    displayCode: 'HP-KISS-001',
    useConfirmText: '진짜 사용한 뒤에만 완료로 바꿔 주세요.',
    memoryTitle: '쪽쪽 쿠폰 사용',
    memoryDescription: '쪽쪽 쿠폰이 아주 작은 특별한 기록으로 남았어요.',
  },
  {
    id: 'walk-date',
    title: '산책 데이트 쿠폰',
    description: '급하지 않게 같이 걷는 날을 예약하는 쿠폰.',
    unlockCondition: '다음 선물 스테이지에서 공개',
    qrPayload: 'HAIMPANG:WALK:001',
    category: 'date',
    displayCode: 'HP-WALK-001',
    useConfirmText: '산책 데이트가 끝난 뒤에 사용 완료로 바꿔 주세요.',
    memoryTitle: '산책 데이트 쿠폰 사용',
    memoryDescription: '산책 데이트 쿠폰이 조용한 하루 기록으로 남았어요.',
  },
  {
    id: 'dessert',
    title: '디저트 쿠폰',
    description: '효임이 고르는 달달한 디저트 한 번.',
    unlockCondition: '다음 선물 스테이지에서 공개',
    qrPayload: 'HAIMPANG:DESSERT:001',
    category: 'food',
    displayCode: 'HP-DESSERT-001',
    useConfirmText: '디저트를 먹은 뒤에 사용 완료로 바꿔 주세요.',
    memoryTitle: '디저트 쿠폰 사용',
    memoryDescription: '디저트 쿠폰이 달달한 기억으로 바뀌었어요.',
  },
  {
    id: 'movie-choice',
    title: '영화 선택권',
    description: '다음에 같이 볼 영화를 효임이 고르는 쿠폰.',
    unlockCondition: '다음 선물 스테이지에서 공개',
    qrPayload: 'HAIMPANG:MOVIE:001',
    category: 'date',
    displayCode: 'HP-MOVIE-001',
    useConfirmText: '영화가 정해진 뒤에 사용 완료로 바꿔 주세요.',
    memoryTitle: '영화 선택권 사용',
    memoryDescription: '영화 선택권이 다음 감상 밤으로 이어졌어요.',
  },
  {
    id: 'special-gift',
    title: '특별 선물 쿠폰',
    description: '좋은 날을 위해 남겨둔 작은 깜짝 선물.',
    unlockCondition: '다음 선물 스테이지에서 공개',
    qrPayload: 'HAIMPANG:SPECIAL:001',
    category: 'special',
    displayCode: 'HP-SPECIAL-001',
    useConfirmText: '특별 선물을 받은 뒤에 사용 완료로 바꿔 주세요.',
    memoryTitle: '특별 선물 쿠폰 사용',
    memoryDescription: '특별 선물 쿠폰이 진짜 선물 기록으로 남았어요.',
  },
];
