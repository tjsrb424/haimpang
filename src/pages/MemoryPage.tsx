import { SectionHeader } from '../components/SectionHeader';
import { achievements } from '../data/achievements';
import type { HaimpangSave, MemoryLogCategory, MemoryLogEntry } from '../save/saveManager';
import { getMemoryPresentation } from '../game/presentation/memoryPresentation';

interface MemoryPageProps {
  save: HaimpangSave;
}

const sections: Array<{ category: MemoryLogCategory; title: string; empty: string }> = [
  {
    category: 'stage_clear',
    title: '스테이지 클리어 기록',
    empty: '아직 열린 선물 상자가 없어요.',
  },
  { category: 'coupon_unlock', title: '쿠폰 해금 기록', empty: '새 쿠폰이 열리면 여기에 남아요.' },
  {
    category: 'coupon_used',
    title: '쿠폰 사용 기록',
    empty: '쿠폰을 사용하면 작은 추억으로 저장돼요.',
  },
  { category: 'system', title: '앱 기록', empty: '기본 기록이 여기에 보여요.' },
  { category: 'special', title: '특별 기록', empty: '특별한 순간을 기다리는 중이에요.' },
];

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function logsByCategory(logs: MemoryLogEntry[], category: MemoryLogCategory): MemoryLogEntry[] {
  return logs.filter((log) => log.category === category);
}

export function MemoryPage({ save }: MemoryPageProps) {
  return (
    <section className="page-stack memory-page">
      <SectionHeader
        eyebrow="추억"
        title="선물과 사용 기록이 쌓이는 곳"
        description="스테이지를 깬 날, 쿠폰이 열린 날, 실제로 사용한 날을 차분하게 모아둡니다."
      />

      <div className="memory-summary">
        <div>
          <strong>{save.clearedStages.length}</strong>
          <span>클리어</span>
        </div>
        <div>
          <strong>{save.usedCoupons.length}</strong>
          <span>사용 쿠폰</span>
        </div>
        <div>
          <strong>{save.memoryLogs.length}</strong>
          <span>기록</span>
        </div>
      </div>

      {sections.map((section) => {
        const logs = logsByCategory(save.memoryLogs, section.category);

        return (
          <div className="memory-section" key={section.category}>
            <div className="memory-section-head">
              <h3>{section.title}</h3>
              <span>{logs.length}</span>
            </div>
            <div className="memory-list">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const presentation = getMemoryPresentation(log);
                  return (
                    <article className={`memory-card ${log.category}`} key={log.id}>
                      <time>{formatDate(log.date)}</time>
                      <h3>{presentation.title}</h3>
                      <p>{presentation.description}</p>
                    </article>
                  );
                })
              ) : (
                <article className="memory-card empty">
                  <p>{section.empty}</p>
                </article>
              )}
            </div>
          </div>
        );
      })}

      <div className="achievement-strip">
        {achievements.map((achievement) => (
          <article className="achievement-card" key={achievement.id}>
            <h3>{achievement.title}</h3>
            <p>{achievement.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
