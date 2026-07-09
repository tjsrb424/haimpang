import { SectionHeader } from '../components/SectionHeader';
import { coupons } from '../data/coupons';
import type { CouponStatus, HaimpangSave } from '../save/saveManager';

interface WalletPageProps {
  save: HaimpangSave;
}

const statusLabels: Record<CouponStatus, string> = {
  locked: '잠김',
  available: '사용 가능',
  used: '사용 완료',
};

export function WalletPage({ save }: WalletPageProps) {
  const availableCount = save.couponWallet.filter((entry) => entry.status === 'available').length;

  return (
    <section className="page-stack">
      <SectionHeader
        eyebrow="쿠폰 지갑"
        title="필요할 때 꺼내 쓰는 작은 선물"
        description="아직은 앱 내부 확인용 코드로만 표시하고, 실제 사용 처리는 다음 스프린트에서 붙입니다."
      />

      <div className="wallet-summary">
        <div>
          <p className="eyebrow">사용 가능 쿠폰</p>
          <strong>{availableCount}개</strong>
        </div>
        <span className="soft-badge">MVP 코드</span>
      </div>

      <div className="coupon-list">
        {coupons.map((coupon) => {
          const walletEntry = save.couponWallet.find((entry) => entry.id === coupon.id);
          const status = walletEntry?.status ?? 'locked';

          return (
            <article className={`coupon-card ${status}`} key={coupon.id}>
              <div>
                <span className={`coupon-badge ${status}`}>{statusLabels[status]}</span>
                <h3>{coupon.title}</h3>
                <p>{coupon.description}</p>
                {status === 'locked' && <p className="mini-note">해금 조건: {coupon.unlockCondition}</p>}
              </div>
              <div className="coupon-meta">
                <code className="coupon-code">{status === 'available' ? coupon.qrPayload : 'LOCKED'}</code>
                <button type="button" className="coupon-action">
                  {status === 'available' ? '열기' : '보기'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
