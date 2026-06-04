import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CycleInsightCard from '../components/CycleInsightCard.jsx';
import HealthLogCalendarGrid from '../components/HealthLogCalendarGrid.jsx';
import HealthLogDayDetail from '../components/HealthLogDayDetail.jsx';
import PetSwitcher from '../components/PetSwitcher.jsx';
import PetTodoComposer from '../components/PetTodoComposer.jsx';
import RecordEntryModal from '../components/RecordEntryModal.jsx';
import RecordEntryRows from '../components/RecordEntryRows.jsx';
import { useDailyCareRecords, useMonthlyDailyCareRecords } from '../hooks/useDailyCareRecords.js';
import { useMonthlyHealthLogs } from '../hooks/useMonthlyHealthLogs.js';
import { usePetStickers } from '../hooks/usePetStickers.js';
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
  const [unlockNotice, setUnlockNotice] = useState('');
  const [todoComposerOpen, setTodoComposerOpen] = useState(false);
  const { activePetId, error: petError, loading: petLoading, pet, pets, selectPet } = usePets();
  const { error: careError, loadMonthRecords, loading: careLoading, records } = useMonthlyDailyCareRecords(pet?.id, monthDate);
  const { error: healthLogError, loading: healthLogLoading, logs: healthLogs } = useMonthlyHealthLogs(pet?.id, monthDate);
  const {
    error: todayCareError,
    loading: todayCareLoading,
    saveCareRecordForDate,
    saving: todayCareSaving,
  } = useDailyCareRecords(pet?.id);
  const { createTodo, error: todoError, loading: todoLoading, saving: todoSaving, todos } = usePetTodos(pet?.id);
  const { saveRewardSticker } = usePetStickers(pet?.id);
  const recordsByDate = useMemo(() => groupByDate(records, 'record_date'), [records]);
  const healthLogsByDate = useMemo(() => groupByDate(healthLogs, 'log_date'), [healthLogs]);
  const cycleInfo = useMemo(() => getCycleMarkers({ monthDate, pet: pet || {}, records }), [monthDate, pet, records]);
  const todosByDate = useMemo(() => groupByDate(todos, 'due_date'), [todos]);
  const selectedRecord = recordsByDate[selectedDate]?.[0] || null;
  const selectedHealthLog = healthLogsByDate[selectedDate]?.[0] || null;
  const selectedTodos = todosByDate[selectedDate] || [];
  const isFutureDate = selectedDate > getLocalDateString();
  const error = petError || healthLogError || careError || todoError;

  const changeMonth = (offset) => {
    const nextMonth = moveMonth(monthDate, offset);
    setMonthDate(nextMonth);
    setSelectedDate(getLocalDateString(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1)));
  };

  const saveSelectedCare = async (patch) => {
    setUnlockNotice('');
    const savedRecord = await saveCareRecordForDate(selectedDate, patch, selectedRecord);
    await loadMonthRecords();
    if (selectedDate <= getLocalDateString()) {
      try {
        const sticker = await saveRewardSticker({ date: selectedDate, pet, record: savedRecord });
        if (sticker) setUnlockNotice(`已解锁 ${sticker.title || `${pet.name}的今日贴纸`}，可以去贴纸册查看。`);
      } catch {
        setUnlockNotice('记录已保存，贴纸解锁需要先确认 pet-stickers 存储桶可用。');
      }
    }
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

      {unlockNotice && (
        <section className="rounded-card border border-paw-healthy/30 bg-paw-healthy/10 p-4 text-sm text-paw-healthy">
          {unlockNotice}
        </section>
      )}

      <RecordEntryRows
        disabled={isFutureDate}
        disabledText="未来日期只能查看预测和待办，不能提前填写记录。"
        onOpenSection={setActiveSection}
        pet={pet}
        record={selectedRecord}
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

      {todayCareError && (
        <section className="rounded-card border border-paw-danger bg-paw-danger/10 p-4 text-sm text-paw-danger">
          {todayCareError}
        </section>
      )}

      <RecordEntryModal
        onClose={() => setActiveSection('')}
        onSave={saveSelectedCare}
        open={Boolean(activeSection)}
        pet={pet}
        record={selectedRecord}
        saving={todayCareLoading || todayCareSaving}
        sectionId={activeSection}
      />

      <PetTodoComposer
        initialDueDate={selectedDate}
        onClose={() => setTodoComposerOpen(false)}
        onSubmit={createTodo}
        open={todoComposerOpen}
        saving={todoSaving}
      />
    </div>
  );
}

export default Records;
