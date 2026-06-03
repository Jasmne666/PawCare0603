import { Link, useNavigate } from 'react-router-dom';
import CareReminderList from '../components/CareReminderList.jsx';
import DailyCareCard from '../components/DailyCareCard.jsx';
import {
  AlertList,
  HomeHeader,
  PetScoreCard,
  TodayOverview,
} from '../components/HomeDashboardSections.jsx';
import { HealthTrendDashboard, RecentLogList } from '../components/HomeRecordSections.jsx';
import PetSwitcher from '../components/PetSwitcher.jsx';
import UpcomingTodosCard from '../components/UpcomingTodosCard.jsx';
import { useDailyCareRecords } from '../hooks/useDailyCareRecords.js';
import { usePetTodos } from '../hooks/usePetTodos.js';
import { usePets } from '../hooks/usePets.js';
import { useRecentHealthLogs } from '../hooks/useRecentHealthLogs.js';
import { getHomeAlerts } from '../utils/alerts.js';
import { getCareReminders } from '../utils/careReminders.js';
import { calcHealthScore } from '../utils/healthScore.js';

function LoadingCard({ title }) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <p className="text-sm font-medium text-paw-muted">首页</p>
      <h1 className="mt-2 font-title text-3xl font-semibold">{title}</h1>
    </section>
  );
}

function NoPetCard() {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <p className="text-sm font-medium text-paw-muted">健康总览</p>
      <h1 className="mt-2 font-title text-3xl font-semibold">请先创建宠物档案</h1>
      <p className="mt-3 text-sm leading-6 text-paw-muted">
        首页需要根据宠物档案和每日记录生成健康分、提醒和趋势。
      </p>
      <Link
        className="mt-5 inline-flex rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background"
        to="/profile"
      >
        去创建档案
      </Link>
    </section>
  );
}

function Home() {
  const navigate = useNavigate();
  const { activePetId, error: petError, loading: petLoading, pet, pets, selectPet } = usePets();
  const { error: logError, loading: logLoading, logs } = useRecentHealthLogs(pet?.id, 7);
  const {
    error: dailyCareError,
    feedback: dailyCareFeedback,
    loading: dailyCareLoading,
    record: dailyCareRecord,
    saveQuickRecord,
    saving: dailyCareSaving,
  } = useDailyCareRecords(pet?.id);
  const {
    completeTodo,
    createTodo,
    error: todoError,
    loading: todoLoading,
    saving: todoSaving,
    todos,
  } = usePetTodos(pet?.id);

  if (petLoading) return <LoadingCard title="正在读取健康总览" />;
  if (!pet) return <NoPetCard />;

  const score = calcHealthScore(logs);
  const alerts = getHomeAlerts(pet, logs);
  const careReminders = getCareReminders(pet, logs);
  const today = new Date().toISOString().slice(0, 10);
  const todayLog = logs.find((log) => log.log_date === today);
  const error = petError || logError;

  const handleAlertClick = (alert) => {
    navigate('/ai', { state: { initialQuestion: alert.question } });
  };

  const handleQuickCareSave = async (actionValue) => {
    try {
      await saveQuickRecord(actionValue);
    } catch {
      // 错误已在今日照护卡片中展示。
    }
  };

  return (
    <div className="space-y-4">
      <HomeHeader pet={pet} />
      <PetSwitcher
        activePetId={activePetId}
        label="健康数据属于"
        onSelectPet={selectPet}
        pets={pets}
      />

      {error && (
        <section className="rounded-card border border-paw-danger bg-paw-danger/10 p-4 text-sm text-paw-danger">
          {error}
        </section>
      )}

      <DailyCareCard
        error={dailyCareError}
        feedback={dailyCareFeedback}
        loading={dailyCareLoading}
        onQuickSave={handleQuickCareSave}
        pet={pet}
        record={dailyCareRecord}
        saving={dailyCareSaving}
      />

      <UpcomingTodosCard
        error={todoError}
        loading={todoLoading}
        onCompleteTodo={completeTodo}
        onCreateTodo={createTodo}
        pet={pet}
        saving={todoSaving}
        todos={todos}
      />

      <PetScoreCard pet={pet} score={score} />
      <AlertList alerts={alerts} onAlertClick={handleAlertClick} />
      <TodayOverview todayLog={todayLog} />
      <CareReminderList reminders={careReminders} />

      <div className="grid grid-cols-2 gap-3">
        <Link
          className="rounded-card border border-paw-healthy bg-paw-healthy/10 p-4 text-left"
          to="/log"
        >
          <p className="text-2xl">📝</p>
          <p className="mt-2 text-sm font-semibold text-paw-primary">记录今日</p>
          <p className="mt-1 text-xs text-paw-muted">饮食、排便、心情</p>
        </Link>
        <Link className="rounded-card bg-paw-primary p-4 text-left text-paw-background" to="/ai">
          <p className="text-2xl">✨</p>
          <p className="mt-2 text-sm font-semibold">AI 健康顾问</p>
          <p className="mt-1 text-xs text-paw-background/60">基于近期数据分析</p>
        </Link>
      </div>

      {logLoading ? (
        <LoadingCard title="正在读取最近记录" />
      ) : (
        <>
          <HealthTrendDashboard logs={logs} />
          <RecentLogList logs={logs} />
        </>
      )}
    </div>
  );
}

export default Home;
