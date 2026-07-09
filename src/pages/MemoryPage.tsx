import { SectionHeader } from '../components/SectionHeader';
import { achievements } from '../data/achievements';
import type { HaimpangSave } from '../save/saveManager';

interface MemoryPageProps {
  save: HaimpangSave;
}

export function MemoryPage({ save }: MemoryPageProps) {
  return (
    <section className="page-stack">
      <SectionHeader
        eyebrow="추억"
        title="오늘의 기록을 작은 앨범처럼"
        description="클리어, 쿠폰, 기념 메시지를 카드로 차분하게 모아둡니다."
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

      <div className="memory-list">
        {save.memoryLogs.map((log) => (
          <article className="memory-card" key={log.id}>
            <time>{new Date(log.date).toLocaleDateString('ko-KR')}</time>
            <h3>{log.title}</h3>
            <p>{log.description}</p>
          </article>
        ))}
        <article className="memory-card">
          <time>준비 중</time>
          <h3>받은 쿠폰 기록</h3>
          <p>쿠폰 해금과 사용 내역이 여기에 다이어리 카드처럼 쌓일 예정이에요.</p>
        </article>
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
