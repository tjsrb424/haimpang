import { useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
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

  return (
    <section className="page-stack settings-page">
      <SectionHeader
        eyebrow="설정"
        title="하임팡을 편하게 맞추기"
        description="사운드, 진동, 저장 데이터를 단정하게 관리합니다."
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

      <div className="save-tools">
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

      <p className="version-label">앱 버전 0.1.0 Sprint 1</p>
    </section>
  );
}
