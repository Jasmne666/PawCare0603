import { useState } from 'react';
import { Link } from 'react-router-dom';
import DailyPetTipCard from '../components/DailyPetTipCard.jsx';
import { HomeHeader } from '../components/HomeDashboardSections.jsx';
import PetSwitcher from '../components/PetSwitcher.jsx';
import StickerCaptureModal from '../components/StickerCaptureModal.jsx';
import TodayStickerCard from '../components/TodayStickerCard.jsx';
import UpcomingTodosCard from '../components/UpcomingTodosCard.jsx';
import { getDailyCareLabel } from '../data/dailyCareOptions.js';
import { useDailyCareRecords } from '../hooks/useDailyCareRecords.js';
import { usePetStickers } from '../hooks/usePetStickers.js';
import { usePetTodos } from '../hooks/usePetTodos.js';
import { usePets } from '../hooks/usePets.js';
import { useUserProfile } from '../hooks/useUserProfile.js';
import { getCareFace } from '../utils/careCalendar.js';

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
      <p className="text-sm font-medium text-paw-muted">PawCare</p>
      <h1 className="mt-2 font-title text-3xl font-semibold">先添加一只宠物吧</h1>
      <p className="mt-3 text-sm leading-6 text-paw-muted">
        有了宠物档案后，就可以开始收集贴纸、记录日常和使用 AI 管家。
      </p>
      <Link
        className="mt-5 inline-flex rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background"
        to="/profile"
      >
        去添加宠物
      </Link>
    </section>
  );
}

function TodayStatusHint({ loading, pet, record }) {
  const title = record ? '今天已记录｜查看详情' : '今天还没记录｜去记录';

  return (
    <Link
      className="flex items-center gap-3 rounded-card border border-paw-border bg-paw-card p-4"
      to="/records"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-paw-background text-2xl">
        {loading ? '🐾' : getCareFace(record, pet)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-paw-primary">{title}</p>
        <p className="mt-1 truncate text-xs text-paw-muted">
          {record
            ? `精神 ${getDailyCareLabel('mood', record.mood)} · 互动 ${getDailyCareLabel('interaction', record.interaction)}`
            : '详细吃饭、喝水、便便和互动都放在记录页。'}
        </p>
      </div>
      <span className="text-paw-muted">›</span>
    </Link>
  );
}

function Home() {
  const [captureFile, setCaptureFile] = useState(null);
  const { activePetId, error: petError, loading: petLoading, pet, pets, selectPet } = usePets();
  const { loading: profileLoading, profile } = useUserProfile();
  const {
    error: dailyCareError,
    loading: dailyCareLoading,
    record: dailyCareRecord,
  } = useDailyCareRecords(pet?.id);
  const {
    completeTodo,
    createTodo,
    error: todoError,
    loading: todoLoading,
    saving: todoSaving,
    todos,
  } = usePetTodos(pet?.id);
  const {
    error: stickerError,
    loading: stickerLoading,
    saveSticker,
    saving: stickerSaving,
    todayStickers,
  } = usePetStickers(pet?.id);

  if (petLoading || profileLoading) return <LoadingCard title="正在打开今天的小手账" />;
  if (!pet) return <NoPetCard />;

  const relationName = profile?.pet_relation_name || '主人';
  const error = petError || dailyCareError;

  const handleStickerSave = async (payload) => {
    await saveSticker(payload);
    setCaptureFile(null);
  };

  return (
    <div className="space-y-4">
      <HomeHeader pet={pet} relationName={relationName} />
      <PetSwitcher activePetId={activePetId} label="今天陪伴的是" onSelectPet={selectPet} pets={pets} />

      {error && (
        <section className="rounded-card border border-paw-danger bg-paw-danger/10 p-4 text-sm text-paw-danger">
          {error}
        </section>
      )}

      <TodayStatusHint loading={dailyCareLoading} pet={pet} record={dailyCareRecord} />

      <UpcomingTodosCard
        error={todoError}
        loading={todoLoading}
        onCompleteTodo={completeTodo}
        onCreateTodo={createTodo}
        pet={pet}
        saving={todoSaving}
        todos={todos}
      />

      <TodayStickerCard
        error={stickerError}
        loading={stickerLoading}
        onFileSelected={setCaptureFile}
        pet={pet}
        stickers={todayStickers}
      />

      <DailyPetTipCard />

      <StickerCaptureModal
        defaultPetId={pet.id}
        file={captureFile}
        onClose={() => setCaptureFile(null)}
        onSave={handleStickerSave}
        open={Boolean(captureFile)}
        pets={pets}
        saving={stickerSaving}
      />
    </div>
  );
}

export default Home;
