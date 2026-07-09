import { achievements } from '../data/achievements';
import type { HaimpangSave } from '../save/saveManager';
import { SectionHeader } from '../components/SectionHeader';

interface MemoryPageProps {
  save: HaimpangSave;
}

export function MemoryPage({ save }: MemoryPageProps) {
  return (
    <section className="page-stack">
      <SectionHeader
        eyebrow="추억"
        title="클리어와 쿠폰이 쌓이는 기록장"
        description="스테이지 보상과 기념 메시지가 여기에 남습니다."
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
          <strong>{save.stars}</strong>
          <span>누적 별</span>
        </div>
      </div>

      <div className="timeline">
        {save.memoryLogs.map((log) => (
          <article className="timeline-item" key={log.id}>
            <time>{new Date(log.date).toLocaleDateString('ko-KR')}</time>
            <h3>{log.title}</h3>
            <p>{log.description}</p>
          </article>
        ))}
      </div>

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
