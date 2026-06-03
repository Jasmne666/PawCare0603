import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HistoryEmptyState from '../components/HistoryEmptyState.jsx';
import HistoryLogCard from '../components/HistoryLogCard.jsx';
import PetSwitcher from '../components/PetSwitcher.jsx';
import { usePets } from '../hooks/usePets.js';
import { useRecentHealthLogs } from '../hooks/useRecentHealthLogs.js';
import { isAbnormalLog } from '../utils/logStatus.js';

const filters = [
  { label: '全部', value: 'all' },
  { label: '有异常', value: 'warn' },
  { label: '😊', value: 'happy' },
  { label: '🤒', value: 'sick' },
];

function getFilteredLogs(logs, filter) {
  if (filter === 'warn') return logs.filter(isAbnormalLog);
  if (filter === 'happy') return logs.filter((log) => log.mood === '😊');
  if (filter === 'sick') return logs.filter((log) => log.mood === '🤒');
  return logs;
}

function NoPetCard() {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <p className="text-sm font-medium text-paw-muted">历史</p>
      <h1 className="mt-2 font-title text-3xl font-semibold">请先创建宠物档案</h1>
      <p className="mt-3 text-sm leading-6 text-paw-muted">历史记录需要关联到一只宠物。</p>
      <Link
        className="mt-5 inline-flex rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background"
        to="/profile"
      >
        去创建档案
      </Link>
    </section>
  );
}

function History() {
  const [filter, setFilter] = useState('all');
  const { activePetId, error: petError, loading: petLoading, pet, pets, selectPet } = usePets();
  const { error: logError, loading: logLoading, logs } = useRecentHealthLogs(pet?.id, 100);

  const filteredLogs = useMemo(() => getFilteredLogs(logs, filter), [filter, logs]);
  const loading = petLoading || logLoading;
  const error = petError || logError;

  if (petLoading) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-5">
        <p className="text-sm font-medium text-paw-muted">历史</p>
        <h1 className="mt-2 font-title text-3xl font-semibold">正在读取历史记录</h1>
      </section>
    );
  }

  if (!pet) return <NoPetCard />;

  return (
    <div className="space-y-4">
      <section>
        <p className="text-sm font-medium text-paw-muted">历史</p>
        <h1 className="mt-2 font-title text-3xl font-semibold">历史记录</h1>
        <p className="mt-2 text-sm text-paw-muted">
          {pet.name} 共 {logs.length} 条记录
        </p>
      </section>

      <PetSwitcher activePetId={activePetId} label="查看哪只宠物" onSelectPet={selectPet} pets={pets} />

      {error && (
        <section className="rounded-card border border-paw-danger bg-paw-danger/10 p-4 text-sm text-paw-danger">
          {error}
        </section>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold ${
              filter === item.value
                ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
                : 'border-paw-border bg-paw-card text-paw-muted'
            }`}
            key={item.value}
            onClick={() => setFilter(item.value)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <section className="rounded-card border border-paw-border bg-paw-card p-5 text-sm text-paw-muted">
          正在加载记录...
        </section>
      ) : filteredLogs.length ? (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <HistoryLogCard key={log.id} log={log} />
          ))}
        </div>
      ) : (
        <HistoryEmptyState petName={pet.name} />
      )}
    </div>
  );
}

export default History;
