import type { EffectLabCue } from '../game/phaser/debug/effectLab';
import { TILE_PRESENTATION_LIST } from '../game/presentation/tilePresentation';

export const DESIGN_LAB_SECTIONS = ['tiles', 'specials', 'combos', 'results', 'hud'] as const;

interface DesignLabProps {
  open: boolean;
  effectLabReady: boolean;
  onClose: () => void;
  onPlayCue: (cue: EffectLabCue) => void;
}

const comboCues: Array<{ cue: EffectLabCue; label: string }> = [
  { cue: 'combo-2', label: '2콤보' },
  { cue: 'combo-5', label: '5콤보' },
  { cue: 'combo-8', label: '8콤보' },
  { cue: 'combo-10-haimpang', label: '10콤보 하임팡' },
];

export function DesignLab({ open, effectLabReady, onClose, onPlayCue }: DesignLabProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="design-lab-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Berry Gift Pop 디자인 랩"
    >
      <section className="design-lab-sheet">
        <header>
          <div>
            <p className="eyebrow">개발 전용 미리보기</p>
            <h2>Berry Gift Pop 디자인 랩</h2>
          </div>
          <button
            type="button"
            className="design-lab-close"
            onClick={onClose}
            aria-label="디자인 랩 닫기"
          >
            닫기
          </button>
        </header>

        <section className="design-lab-section">
          <h3>베리 타일</h3>
          <div className="design-tile-grid">
            {TILE_PRESENTATION_LIST.map((tile, index) => (
              <article
                className={
                  index === 0
                    ? 'design-tile selected'
                    : index === 4
                      ? 'design-tile pop-ready'
                      : 'design-tile'
                }
                key={tile.kind}
              >
                <img src={tile.assetPath} alt={`${tile.displayName} 타일`} />
                <strong>{tile.displayName}</strong>
                <small>{index === 0 ? '선택 상태' : index === 4 ? '팝 직전' : tile.visualId}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="design-lab-section">
          <h3>특수 타일</h3>
          <div className="design-special-grid">
            {[
              ['line-horizontal', '가로 빛띠'],
              ['line-vertical', '세로 빛띠'],
              ['bomb', '베리 폭탄'],
              ['rainbow', '프리즘 베리'],
            ].map(([kind, label]) => (
              <article key={kind}>
                <span className={`design-special-preview ${kind}`}>
                  <img src="/assets/game/tiles/strawberry.svg" alt="" />
                  <span />
                </span>
                <strong>{label}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="design-lab-section">
          <h3>콤보 강제 재생</h3>
          <div className="design-combo-actions">
            {comboCues.map(({ cue, label }) => (
              <button
                type="button"
                key={cue}
                disabled={!effectLabReady}
                onClick={() => onPlayCue(cue)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="design-lab-section design-result-samples">
          <h3>결과 화면</h3>
          <div>
            <article className="design-result-card won">
              <span className="mini-gift" aria-hidden="true" />
              <strong>선물 열기 완료!</strong>
              <small>첫 클리어 · 커피 쿠폰 해금</small>
            </article>
            <article className="design-result-card lost">
              <span className="mini-gift closed" aria-hidden="true" />
              <strong>조금만 더!</strong>
              <small>딸기 모으기 12 / 20</small>
            </article>
          </div>
        </section>

        <section className="design-lab-section">
          <h3>HUD 상태</h3>
          <div className="design-hud-grid">
            <span>
              <small>남은 이동</small>
              <strong>18</strong>
            </span>
            <span className="low">
              <small>남은 이동</small>
              <strong>5</strong>
            </span>
            <span>
              <small>미션 1개</small>
              <strong>12 / 20</strong>
            </span>
            <span>
              <small>미션 2개</small>
              <strong>1 / 2</strong>
            </span>
            <span className="done">
              <small>완료 미션</small>
              <strong>완료</strong>
            </span>
          </div>
        </section>
      </section>
    </div>
  );
}
