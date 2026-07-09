import { SectionHeader } from '../components/SectionHeader';
import { coupons } from '../data/coupons';
import { stages } from '../data/stages';
import { getInstallGuideState } from '../pwa/installPrompt';
import { getCouponCounts, type HaimpangSave } from '../save/saveManager';
import { getRecommendedStage, getMissionSummary } from '../stage/stageSelect';

interface HomePageProps {
  save: HaimpangSave;
  onStartGame: () => void;
  onOpenStageSelect: () => void;
  onOpenWallet: () => void;
}

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    food: '먹는 선물',
    date: '데이트',
    care: '케어',
    wish: '소원',
    special: '특별',
  };

  return labels[category] ?? category;
}

export function HomePage({ save, onStartGame, onOpenStageSelect, onOpenWallet }: HomePageProps) {
  const nextStage = getRecommendedStage(stages, save);
  const recentLog = save.memoryLogs[0];
  const couponCounts = getCouponCounts(save);
  const firstAvailableCoupon = save.couponWallet.find((entry) => entry.status === 'available');
  const availableCoupon = firstAvailableCoupon
    ? coupons.find((coupon) => coupon.id === firstAvailableCoupon.id)
    : null;
  const installGuide = getInstallGuideState();

  return (
    <section className="page-stack home-page">
      <div className="hero-panel">
        <SectionHeader
          eyebrow="오늘의 선물"
          title="하임팡 열어줘서 고마워"
          description="스테이지를 깨면 작은 쿠폰이 열리고, 사용한 순간은 추억으로 남아요."
        />
        <div className="hero-actions">
          <button type="button" className="primary-button" onClick={onStartGame}>
            이어서 하기
          </button>
          <button type="button" className="secondary-button" onClick={onOpenStageSelect}>
            스테이지 선택
          </button>
        </div>
      </div>

      <div className="home-stats">
        <article className="stat-card">
          <p className="eyebrow">보유 별</p>
          <strong>{save.stars}</strong>
          <p className="mini-note">선물 해금에 쓰는 반짝 포인트</p>
        </article>
        <article className="stat-card">
          <p className="eyebrow">사용 가능 쿠폰</p>
          <strong>{couponCounts.available}</strong>
          <p className="mini-note">지금 꺼내 쓸 수 있는 선물</p>
        </article>
      </div>

      <article className="continue-card">
        <div>
          <p className="eyebrow">다음 추천 스테이지</p>
          <h3>Stage {nextStage.id}. {nextStage.title}</h3>
          <p>{getMissionSummary(nextStage)}</p>
        </div>
        <button type="button" className="primary-button" onClick={onStartGame}>
          바로 시작
        </button>
      </article>

      <div className="two-column">
        <article className="info-card">
          <p className="eyebrow">쿠폰 지갑</p>
          <h3>{availableCoupon ? availableCoupon.title : '아직 잠긴 선물이 있어요'}</h3>
          <p>
            {availableCoupon
              ? `${categoryLabel(availableCoupon.category)} 쿠폰을 바로 확인할 수 있어요.`
              : `잠긴 쿠폰 ${couponCounts.locked}개가 기다리는 중이에요.`}
          </p>
          <button type="button" className="secondary-button compact-button" onClick={onOpenWallet}>
            지갑 보기
          </button>
        </article>
        <article className="info-card">
          <p className="eyebrow">최근 추억</p>
          <h3>{recentLog?.title ?? '첫 기록 준비 중'}</h3>
          <p>{recentLog?.description ?? '게임과 쿠폰 기록이 여기에 차곡차곡 쌓여요.'}</p>
        </article>
      </div>

      <article className={installGuide.shouldShowGuide ? 'install-card' : 'install-card installed'}>
        <div>
          <p className="eyebrow">PWA 안내</p>
          <h3>{installGuide.title}</h3>
          <p>{installGuide.description}</p>
        </div>
        <span className="soft-badge">{installGuide.standalone ? '설치됨' : 'Android Chrome'}</span>
      </article>
    </section>
  );
}
