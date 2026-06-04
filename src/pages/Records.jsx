import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CycleInsightCard from '../components/CycleInsightCard.jsx';
import HealthLogCalendarGrid from '../components/HealthLogCalendarGrid.jsx';
import HealthLogDayDetail from '../components/HealthLogDayDetail.jsx';
import HealthLogEntryModal from '../components/HealthLogEntryModal.jsx';
import HealthLogEntryRows from '../components/HealthLogEntryRows.jsx';
import PetSwitcher from '../components/PetSwitcher.jsx';
import PetTodoComposer from '../components/PetTodoComposer.jsx';
import { useMonthlyDailyCareRecords } from '../hooks/useDailyCareRecords.js';
import { useHealthLogEntrySave } from '../hooks/useHealthLogEntrySave.js';
import { useMonthlyHealthLogs } from '../hooks/useMonthlyHealthLogs.js';
import { usePetTodos } from '../hooks/usePetTodos.js';
import { usePets } from '../hooks/usePets.js';
import { formatMonthTitle, getLocalDateString, moveMonth } from '../utils/careCalendar.js';
import { getCycleMarkers } from '../utils/cyclePredictions.js';

function LoadingCard({ title }) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <p className="text-sm font-medium text-paw-muted">记录</p>
      <h1 className="mt-2 font-title text-3xl font-semibold">{title}</h1>
    </section>
  );
}

function NoPetCard() {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <p className="text-sm font-medium text-paw-muted">记录</p>
      <h1 className="mt-2 font-title text-3xl font-semibold">请先创建宠物档案</h1>
      <p className="mt-3 text-sm leading-6 text-paw-muted">记录中心需要关联到一只宠物。</p>
      <Link
        className="mt-5 inline-flex rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background"
        to="/profile"
      >
        去创建档案
      </Link>
    </section>
  );
}

function groupByDate(items, key) {
  return items.reduce((map, item) => {
    const dateKey = item[key];
    map[dateKey] = [...(map[dateKey] || []), item];
    return map;
  }, {});
}

function Records() {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [activeSection, setActiveSection] = useState('');
  const [todoComposerOpen, setTodoComposerOpen] = useState(false);
  const { activePetId, error: petError, loading: petLoading, pet, pets, selectPet } = usePets();
  const { error: careError, loading: careLoading, records } = useMonthlyDailyCareRecords(pet?.id, monthDate);
  const { error: healthLogError, loadHealthLogs, loading: healthLogLoading, logs: healthLogs } = useMonthlyHealthLogs(pet?.id, monthDate);
  const { error: healthLogSaveError, saveHealthLogEntry, saving: healthLogSaving } = useHealthLogEntrySave(pet?.id);
  const { createTodo, error: todoError, loading: todoLoading, saving: todoSaving, todos } = usePetTodos(pet?.id, 30);
  const healthLogsByDate = useMemo(() => groupByDate(healthLogs, 'log_date'), [healthLogs]);
  const cycleInfo = useMemo(() => getCycleMarkers({ monthDate, pet: pet || {}, records }), [monthDate, pet, records]);
  const todosByDate = useMemo(() => groupByDate(todos, 'due_date'), [todos]);
  const selectedHealthLog = healthLogsByDate[selectedDate]?.[0] || null;
  const selectedTodos = todosByDate[selectedDate] || [];
  const isFutureDate = selectedDate > getLocalDateString();
  const error = petError || healthLogError || careError || todoError || healthLogSaveError;

  const changeMonth = (offset) => {
    const nextMonth = moveMonth(monthDate, offset);
    setMonthDate(nextMonth);
    setSelectedDate(getLocalDateString(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1)));
  };

  const saveSelectedHealthLog = async (patch) => {
    await saveHealthLogEntry({ dateKey: selectedDate, log: selectedHealthLog, patch });
    await loadHealthLogs();
    setActiveSection('');
  };

  if (petLoading) return <LoadingCard title="正在读取宠物档案" />;
  if (!pet) return <NoPetCard />;

  return (
    <div className="space-y-4">
      <section className="space-y-3">
        <div>
          <p className="text-sm font-medium text-paw-muted">记录</p>
          <h1 className="mt-2 font-title text-3xl font-semibold">健康手账</h1>
          <p className="mt-2 text-sm leading-6 text-paw-muted">
            先选日期，再像手账一样补充吃饭、喝水、便便和状态。
          </p>
        </div>
        <PetSwitcher activePetId={activePetId} label="当前宠物" onSelectPet={selectPet} pets={pets} />
      </section>

      {error && (
        <section className="rounded-card border border-paw-danger bg-paw-danger/10 p-4 text-sm leading-6 text-paw-danger">
          {error}
        </section>
      )}

      <section className="flex items-center justify-between rounded-card border border-paw-border bg-paw-card p-3">
        <button
          className="rounded-control border border-paw-border bg-paw-background px-3 py-2 text-sm font-semibold text-paw-secondary"
          onClick={() => changeMonth(-1)}
          type="button"
        >
          上个月
        </button>
        <h2 className="font-title text-xl font-semibold">{formatMonthTitle(monthDate)}</h2>
        <button
          className="rounded-control border border-paw-border bg-paw-background px-3 py-2 text-sm font-semibold text-paw-secondary"
          onClick={() => changeMonth(1)}
          type="button"
        >
          下个月
        </button>
      </section>

      {healthLogLoading || careLoading || todoLoading ? (
        <LoadingCard title="正在生成记录月历" />
      ) : (
        <HealthLogCalendarGrid
          logsByDate={Object.fromEntries(
            Object.entries(healthLogsByDate).map(([dateKey, value]) => [dateKey, value[0]]),
          )}
          monthDate={monthDate}
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
        />
      )}

      <HealthLogDayDetail dateKey={selectedDate} log={selectedHealthLog} />

      <HealthLogEntryRows
        disabled={isFutureDate}
        disabledText="未来日期只能查看预测和待办，不能提前填写记录。"
        onOpenSection={setActiveSection}
        log={selectedHealthLog}
      />
      <CycleInsightCard notes={cycleInfo.notes} />

      {selectedTodos.length > 0 && (
        <section className="rounded-card border border-paw-border bg-paw-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-paw-primary">当天待办</h2>
            <button className="text-xs font-semibold text-paw-healthy" onClick={() => setTodoComposerOpen(true)} type="button">
              添加待办
            </button>
          </div>
          <div className="space-y-2">
            {selectedTodos.map((todo) => (
              <p className="rounded-control bg-paw-background px-3 py-2 text-xs text-paw-muted" key={todo.id}>
                {todo.title}
              </p>
            ))}
          </div>
        </section>
      )}

      <HealthLogEntryModal
        log={selectedHealthLog}
        onClose={() => setActiveSection('')}
        onSave={saveSelectedHealthLog}
        open={Boolean(activeSection)}
        saving={healthLogSaving}
        sectionId={activeSection}
      />

      <PetTodoComposer
        initialDueDate={selectedDate}
        onClose={() => setTodoComposerOpen(false)}
        onSubmit={createTodo}
        open={todoComposerOpen}
        pet={pet}
        saving={todoSaving}
      />
    </div>
  );
}

export default Records;
