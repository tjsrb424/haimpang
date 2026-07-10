import { coupons } from '../data/coupons';
import type { StageDefinition } from '../data/stages';
import { getMissionDisplayLabel } from '../game/presentation/missionPresentation';
import type { StageFinishResult } from '../game/session/stageSession';

interface ResultOverlayProps {
  stage: StageDefinition;
  result: StageFinishResult;
  highestCombo: number;
  onReplay: () => void;
  onNextStage: () => void;
  onStageSelect: () => void;
  onOpenWallet: () => void;
  onHome: () => void;
}

export function ResultOverlay({
  stage,
  result,
  highestCombo,
  onReplay,
  onNextStage,
  onStageSelect,
  onOpenWallet,
  onHome,
}: ResultOverlayProps) {
  const won = result.status === 'won';
  const coupon = result.reward?.couponId
    ? coupons.find((entry) => entry.id === result.reward?.couponId)
    : null;

  return (
    <div className="result-overlay" role="dialog" aria-modal="true" aria-label="스테이지 결과">
      <article className={won ? 'result-card won' : 'result-card lost'}>
        <div className={won ? 'gift-result-art open' : 'gift-result-art'} aria-hidden="true">
          <span className="gift-box-lid" />
          <span className="gift-box-base" />
          <span className="gift-ribbon" />
          <span className="gift-spark one" />
          <span className="gift-spark two" />
        </div>
        <p className="eyebrow">스테이지 {stage.id}</p>
        <h2>{won ? '선물 열기 완료!' : '조금만 더!'}</h2>
        <p className="result-lead">
          {won
            ? '베리 상자가 열리고 작은 선물이 도착했어요.'
            : '여기까지 정말 잘했어요. 한 번 더 팡팡 터뜨려 볼까요?'}
        </p>

        {won ? (
          <div className="result-rewards">
            <span>
              <small>최종 점수</small>
              <strong>{result.score.toLocaleString('ko-KR')}</strong>
            </span>
            <span>
              <small>최고 콤보</small>
              <strong>{highestCombo > 1 ? `${highestCombo}콤보` : '없음'}</strong>
            </span>
            {result.firstClear && result.reward && (
              <>
                <span>
                  <small>획득 별</small>
                  <strong>+{result.reward.stars}</strong>
                </span>
                {result.reward.hearts && (
                  <span>
                    <small>획득 하트</small>
                    <strong>+{result.reward.hearts}</strong>
                  </span>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="result-missions">
            {result.missionProgress.map((mission) => (
              <div key={mission.missionIndex}>
                <span>{getMissionDisplayLabel(stage.missions[mission.missionIndex])}</span>
                <strong>
                  {mission.current} / {mission.required}
                </strong>
              </div>
            ))}
          </div>
        )}

        {won && result.firstClear && (
          <p className="first-clear-note">첫 클리어 보상이 저장됐어요</p>
        )}
        {won && !result.firstClear && (
          <p className="first-clear-note claimed">첫 클리어 보상 지급 완료</p>
        )}
        {won && result.firstClear && coupon && (
          <p className="coupon-unlock-note">
            <span aria-hidden="true" /> {coupon.title} 해금
          </p>
        )}

        <div className="result-actions">
          <button type="button" className="primary-button" onClick={won ? onNextStage : onReplay}>
            {won ? '다음 선물' : '다시 하기'}
          </button>
          {won && coupon && (
            <button type="button" className="secondary-button" onClick={onOpenWallet}>
              쿠폰 지갑
            </button>
          )}
          {won && (
            <button type="button" className="secondary-button" onClick={onReplay}>
              다시 하기
            </button>
          )}
          <div className="result-text-actions">
            <button type="button" onClick={onStageSelect}>
              스테이지 선택
            </button>
            <button type="button" onClick={onHome}>
              홈으로
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
