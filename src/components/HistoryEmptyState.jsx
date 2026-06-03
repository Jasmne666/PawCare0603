import { Link } from 'react-router-dom';

function HistoryEmptyState({ petName }) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5 text-center">
      <div className="text-4xl">📝</div>
      <h2 className="mt-3 font-title text-xl font-semibold">还没有记录</h2>
      <p className="mt-2 text-sm leading-6 text-paw-muted">
        给{petName}保存第一条健康记录后，这里会按日期倒序展示。
      </p>
      <Link
        className="mt-5 inline-flex rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background"
        to="/log"
      >
        去记录
      </Link>
    </section>
  );
}

export default HistoryEmptyState;
