import { useMemo, useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { coupons, type CouponDefinition } from '../data/coupons';
import {
  getCouponCounts,
  getCouponStatus,
  type CouponStatus,
  type HaimpangSave,
} from '../save/saveManager';

interface WalletPageProps {
  save: HaimpangSave;
  onUseCoupon: (couponId: string) => void;
}

const statusLabels: Record<CouponStatus, string> = {
  locked: '잠금',
  available: '사용 가능',
  used: '사용 완료',
};

const categoryLabels: Record<CouponDefinition['category'], string> = {
  food: '먹는 선물',
  date: '데이트',
  care: '케어',
  wish: '소원',
  special: '특별',
};

function formatUsedAt(usedAt: string | null): string {
  if (!usedAt) {
    return '';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(usedAt));
}

function qrCells(payload: string): boolean[] {
  const seed = Array.from(payload).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return Array.from({ length: 49 }, (_, index) => {
    const row = Math.floor(index / 7);
    const col = index % 7;
    const finder =
      (row < 2 && col < 2) ||
      (row < 2 && col > 4) ||
      (row > 4 && col < 2);
    return finder || (seed + row * 7 + col * 11) % 3 === 0;
  });
}

export function WalletPage({ save, onUseCoupon }: WalletPageProps) {
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [confirmingUse, setConfirmingUse] = useState(false);
  const counts = getCouponCounts(save);
  const selectedCoupon = coupons.find((coupon) => coupon.id === selectedCouponId) ?? null;
  const selectedStatus = selectedCoupon ? getCouponStatus(save, selectedCoupon.id) : 'locked';
  const selectedEntry = selectedCoupon
    ? save.couponWallet.find((entry) => entry.id === selectedCoupon.id)
    : undefined;
  const selectedQrCells = useMemo(
    () => qrCells(selectedCoupon?.qrPayload ?? 'HAIMPANG'),
    [selectedCoupon?.qrPayload],
  );

  const closeDetail = () => {
    setSelectedCouponId(null);
    setConfirmingUse(false);
  };

  const completeUse = () => {
    if (!selectedCoupon) {
      return;
    }

    onUseCoupon(selectedCoupon.id);
    setConfirmingUse(false);
  };

  return (
    <section className="page-stack wallet-page">
      <SectionHeader
        eyebrow="쿠폰 지갑"
        title="꺼내 쓰는 작은 선물들"
        description="열린 쿠폰은 선규에게 보여주고, 실제로 사용한 뒤 완료 처리해 주세요."
      />

      <div className="wallet-summary">
        <div>
          <p className="eyebrow">사용 가능</p>
          <strong>{counts.available}개</strong>
        </div>
        <div>
          <p className="eyebrow">사용 완료</p>
          <strong>{counts.used}개</strong>
        </div>
        <div>
          <p className="eyebrow">잠금</p>
          <strong>{counts.locked}개</strong>
        </div>
      </div>

      <div className="coupon-list">
        {coupons.map((coupon) => {
          const walletEntry = save.couponWallet.find((entry) => entry.id === coupon.id);
          const status = walletEntry?.status ?? 'locked';

          return (
            <article className={`coupon-card ${status}`} key={coupon.id}>
              <div>
                <div className="coupon-title-row">
                  <span className={`coupon-badge ${status}`}>{statusLabels[status]}</span>
                  <span className="soft-badge">{categoryLabels[coupon.category]}</span>
                </div>
                <h3>{coupon.title}</h3>
                <p>{coupon.description}</p>
                {status === 'locked' && <p className="mini-note">해금 조건: {coupon.unlockCondition}</p>}
                {status === 'used' && <p className="mini-note">사용일: {formatUsedAt(walletEntry?.usedAt ?? null)}</p>}
              </div>
              <div className="coupon-meta">
                <code className="coupon-code">{status === 'locked' ? 'LOCKED' : coupon.displayCode}</code>
                <button
                  type="button"
                  className="coupon-action"
                  onClick={() => {
                    setSelectedCouponId(coupon.id);
                    setConfirmingUse(false);
                  }}
                >
                  상세 보기
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {selectedCoupon && (
        <div className="coupon-modal-backdrop" role="dialog" aria-modal="true" aria-label="쿠폰 상세">
          <article className={`coupon-detail ${selectedStatus}`}>
            <div className="coupon-detail-head">
              <div>
                <span className={`coupon-badge ${selectedStatus}`}>{statusLabels[selectedStatus]}</span>
                <h2>{selectedCoupon.title}</h2>
                <p>{selectedCoupon.description}</p>
              </div>
              <button type="button" className="icon-button" onClick={closeDetail} aria-label="닫기">
                ×
              </button>
            </div>

            <div className="coupon-code-panel">
              <div className="qr-placeholder" aria-label="쿠폰 QR 대체 코드">
                {selectedQrCells.map((active, index) => (
                  <span className={active ? 'active' : ''} key={index} />
                ))}
              </div>
              <div>
                <p className="eyebrow">교환 코드</p>
                <code>{selectedStatus === 'locked' ? 'LOCKED' : selectedCoupon.displayCode}</code>
                <p className="mini-note">
                  {selectedStatus === 'locked'
                    ? `해금 조건: ${selectedCoupon.unlockCondition}`
                    : '이 화면을 선규에게 보여주면 사용할 수 있어요.'}
                </p>
              </div>
            </div>

            {selectedStatus === 'available' && (
              <div className="coupon-use-panel">
                <p>{selectedCoupon.useConfirmText}</p>
                {!confirmingUse ? (
                  <button type="button" className="primary-button" onClick={() => setConfirmingUse(true)}>
                    사용 완료
                  </button>
                ) : (
                  <div className="confirm-panel">
                    <strong>이 쿠폰을 사용 완료로 바꿀까요?</strong>
                    <p>사용 완료 후에는 다시 사용할 수 없어요. 선규에게 보여주고 사용했다면 완료해 주세요.</p>
                    <button type="button" className="danger-button" onClick={completeUse}>
                      정말 사용 완료하기
                    </button>
                    <button type="button" className="secondary-button" onClick={() => setConfirmingUse(false)}>
                      아직 아니에요
                    </button>
                  </div>
                )}
              </div>
            )}

            {selectedStatus === 'used' && (
              <div className="coupon-use-panel calm">
                <strong>이미 사용한 쿠폰이에요.</strong>
                <p>사용일: {formatUsedAt(selectedEntry?.usedAt ?? null)}</p>
              </div>
            )}

            {selectedStatus === 'locked' && (
              <div className="coupon-use-panel calm">
                <strong>아직 잠긴 쿠폰이에요.</strong>
                <p>{selectedCoupon.unlockCondition}</p>
              </div>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
