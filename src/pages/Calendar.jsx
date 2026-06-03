import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DailyCareDetailCard from '../components/DailyCareDetailCard.jsx';
import HealthCalendarGrid from '../components/HealthCalendarGrid.jsx';
import PetSwitcher from '../components/PetSwitcher.jsx';
import { useMonthlyDailyCareRecords } from '../hooks/useDailyCareRecords.js';
import { usePets } from '../hooks/usePets.js';
import { formatMonthTitle, getLocalDateString, moveMonth } from '../utils/careCalendar.js';

function LoadingCard({ title }) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <p className="text-sm font-medium text-paw-muted">健康日历</p>
      <h1 className="mt-2 font-title text-3xl font-semibold">{title}</h1>
    </section>
  );
}

function NoPetCard() {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <p className="text-sm font-medium text-paw-muted">健康日历</p>
      <h1 className="mt-2 font-title text-3xl font-semibold">请先创建宠物档案</h1>
      <p className="mt-3 text-sm leading-6 text-paw-muted">健康日历需要关联到一只宠物。</p>
      <Link
        className="mt-5 inline-flex rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background"
        to="/profile"
      >
        去创建档案
      </Link>
    </section>
  );
}

function Calendar() {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const { activePetId, error: petError, loading: petLoading, pet, pets, selectPet } = usePets();
  const { error, loading, records } = useMonthlyDailyCareRecords(pet?.id, monthDate);
  const recordsByDate = useMemo(
    () =>
      records.reduce((map, record) => {
        map[record.record_date] = record;
        return map;
      }, {}),
    [records],
  );
  const selectedRecord = recordsByDate[selectedDate] || null;

  const changeMonth = (offset) => {
    const nextMonth = moveMonth(monthDate, offset);
    setMonthDate(nextMonth);
    setSelectedDate(getLocalDateString(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1)));
  };

  if (petLoading) return <LoadingCard title="正在读取宠物档案" />;
  if (!pet) return <NoPetCard />;

  return (
    <div className="space-y-4">
      <section className="space-y-3">
        <div>
          <p className="text-sm font-medium text-paw-muted">健康日历</p>
          <h1 className="mt-2 font-title text-3xl font-semibold">照护月历</h1>
          <p className="mt-2 text-sm leading-6 text-paw-muted">
            每天的小表情来自今日照护记录，适合快速回看状态变化。
          </p>
        </div>
        <PetSwitcher activePetId={activePetId} label="当前宠物" onSelectPet={selectPet} pets={pets} />
      </section>

      {(error || petError) && (
        <section className="rounded-card border border-paw-danger bg-paw-danger/10 p-4 text-sm leading-6 text-paw-danger">
          {error || petError}
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

      {loading ? (
        <LoadingCard title="正在生成月历" />
      ) : (
        <HealthCalendarGrid
          monthDate={monthDate}
          onSelectDate={setSelectedDate}
          pet={pet}
          recordsByDate={recordsByDate}
          selectedDate={selectedDate}
        />
      )}

      <DailyCareDetailCard dateKey={selectedDate} pet={pet} record={selectedRecord} />
    </div>
  );
}

export default Calendar;
