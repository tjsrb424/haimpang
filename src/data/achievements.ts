export interface AchievementData {
  id: string;
  title: string;
  description: string;
}

export const achievements: AchievementData[] = [
  {
    id: 'first-clear',
    title: '첫 클리어',
    description: '처음으로 스테이지를 클리어했어요.',
  },
  {
    id: 'stage-10',
    title: '열 번째 발자국',
    description: '10스테이지를 클리어했어요.',
  },
  {
    id: 'cascade-5',
    title: '반짝 연쇄',
    description: '5연쇄를 달성했어요.',
  },
  {
    id: 'first-coupon',
    title: '첫 쿠폰',
    description: '처음으로 쿠폰을 열었어요.',
  },
];
