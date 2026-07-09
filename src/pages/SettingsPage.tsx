import { useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { getInstallGuideState } from '../pwa/installPrompt';
import type { HaimpangSave } from '../save/saveManager';

interface SettingsPageProps {
  save: HaimpangSave;
  exportedSave: string;
  onToggleSetting: (key: keyof HaimpangSave['settings']) => void;
  onResetSave: () => void;
  onImportSave: (payload: string) => void;
}

export function SettingsPage({
  save,
  exportedSave,
  onToggleSetting,
  onResetSave,
  onImportSave,
}: SettingsPageProps) {
  const [importPayload, setImportPayload] = useState('');
  const installGuide = getInstallGuideState();

  return (
    <section className="page-stack settings-page">
      <SectionHeader
        eyebrow="설정"
        title="하임팡을 편하게 관리하기"
        description="진동, 디버그 패널, 저장 데이터, 홈 화면 설치 안내를 한곳에서 확인해요."
      />

      <div className="settings-list">
        <label className="toggle-row">
          <span>사운드</span>
          <input
            type="checkbox"
            checked={save.settings.sound}
            onChange={() => onToggleSetting('sound')}
          />
        </label>
        <label className="toggle-row">
          <span>진동</span>
          <input
            type="checkbox"
            checked={save.settings.vibration}
            onChange={() => onToggleSetting('vibration')}
          />
        </label>
        <label className="toggle-row">
          <span>디버그 패널</span>
          <input
            type="checkbox"
            checked={save.settings.debugPanel}
            onChange={() => onToggleSetting('debugPanel')}
          />
        </label>
      </div>

      <article className={installGuide.shouldShowGuide ? 'install-card' : 'install-card installed'}>
        <div>
          <p className="eyebrow">앱 설치 안내</p>
          <h3>{installGuide.title}</h3>
          <p>{installGuide.description}</p>
          <p className="mini-note">Android Chrome 메뉴에서 홈 화면에 추가를 선택하면 가장 자연스럽게 쓸 수 있어요.</p>
        </div>
        <span className="soft-badge">{installGuide.standalone ? '실행 중' : '설치 도움말'}</span>
      </article>

      <div className="save-tools">
        <div>
          <p className="eyebrow">데이터 관리</p>
          <p className="mini-note">저장 데이터는 이 기기의 브라우저 저장소에 보관돼요.</p>
        </div>
        <label>
          저장 데이터 export
          <textarea readOnly value={exportedSave} rows={5} />
        </label>
        <label>
          저장 데이터 import
          <textarea
            value={importPayload}
            rows={4}
            onChange={(event) => setImportPayload(event.target.value)}
          />
        </label>
        <div className="settings-actions">
          <button type="button" className="secondary-button" onClick={() => onImportSave(importPayload)}>
            가져오기
          </button>
          <button type="button" className="danger-button" onClick={onResetSave}>
            데이터 초기화
          </button>
        </div>
      </div>

      <p className="version-label">앱 버전 0.1.0 Sprint 6</p>
    </section>
  );
}
