import { coupons } from '../data/coupons';
import type { HaimpangSave } from '../save/saveManager';
import { SectionHeader } from '../components/SectionHeader';

interface WalletPageProps {
  save: HaimpangSave;
}

export function WalletPage({ save }: WalletPageProps) {
  return (
    <section className="page-stack">
      <SectionHeader
        eyebrow="쿠폰 지갑"
        title="쓸 때마다 기분 좋아지는 쿠폰"
        description="MVP에서는 앱 내부 확인용 코드로 먼저 보여줍니다."
      />

      <div className="coupon-list">
        {coupons.map((coupon) => {
          const walletEntry = save.couponWallet.find((entry) => entry.id === coupon.id);
          const status = walletEntry?.status ?? 'locked';

          return (
            <article className={`coupon-card ${status}`} key={coupon.id}>
              <div>
                <p className="eyebrow">{status === 'available' ? '사용 가능' : status}</p>
                <h3>{coupon.title}</h3>
                <p>{coupon.description}</p>
              </div>
              <code>{status === 'available' ? coupon.qrPayload : 'LOCKED'}</code>
            </article>
          );
        })}
      </div>
    </section>
  );
}
