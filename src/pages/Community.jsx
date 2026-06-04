import { useState } from 'react';
import CommunityFeed from '../components/CommunityFeed.jsx';
import PetSwitcher from '../components/PetSwitcher.jsx';
import PostComposer from '../components/PostComposer.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useCommunityPosts } from '../hooks/useCommunityPosts.js';
import { usePets } from '../hooks/usePets.js';

const tabs = [
  { label: '广场', value: 'all' },
  { label: '关注', value: 'following' },
];

const dailyTopics = [
  '今天你家主子/狗子做了什么让你崩溃又爱它的事？',
  '晒一张你家宠物最近最可爱的照片 📸',
  '你家宠物有什么奇葩饮食习惯？',
  '你是怎么发现自己爱上养宠这件事的？',
  '你给宠物起名字有什么故事？',
  '今天带宠物出门了吗？去了哪里？',
  '你家宠物最近有让你担心的症状吗？来问问大家',
];

function getTodayTopic() {
  const today = new Date();
  const daySeed = today.getFullYear() * 1000 + Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return dailyTopics[daySeed % dailyTopics.length];
}

function Community() {
  const [feed, setFeed] = useState('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialContent, setComposerInitialContent] = useState('');
  const { user } = useAuth();
  const { activePetId, loading: petLoading, pet, pets, selectPet } = usePets();
  const todayTopic = getTodayTopic();
  const {
    bumpCommentCount,
    createPost,
    error,
    loading,
    posts,
    saving,
    toggleFollowPet,
    toggleLike,
  } = useCommunityPosts({ feed, postType: 'normal' });

  const handleCreatePost = async ({ content, files, publishPet }) => {
    await createPost({ content, files, pet, publishPet, type: 'normal' });
    setComposerOpen(false);
  };

  const openComposer = (initialContent = '') => {
    setComposerInitialContent(initialContent);
    setComposerOpen(true);
  };

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-paw-muted">社区</p>
          <h1 className="mt-2 font-title text-3xl font-semibold">社区广场</h1>
          <p className="mt-2 text-sm text-paw-muted">看看其他宠物的新鲜事，也让更多人认识你的宠物。</p>
        </div>
        <button
          className="shrink-0 rounded-card bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background disabled:opacity-60"
          disabled={petLoading || !pet}
          onClick={() => openComposer()}
          type="button"
        >
          发布
        </button>
      </section>

      {error && (
        <section className="rounded-card border border-paw-danger bg-paw-danger/10 p-4 text-sm text-paw-danger">
          {error}
        </section>
      )}

      {!pet && !petLoading && (
        <section className="rounded-card border border-paw-warning bg-paw-warning/10 p-4 text-sm text-paw-secondary">
          创建宠物档案后才能发布动态。
        </section>
      )}

      <PetSwitcher activePetId={activePetId} label="发布身份" onSelectPet={selectPet} pets={pets} />

      <div className="grid grid-cols-2 gap-2 rounded-card border border-paw-border bg-paw-card p-1">
        {tabs.map((tab) => (
          <button
            className={`rounded-control px-4 py-2 text-sm font-semibold ${
              feed === tab.value ? 'bg-paw-primary text-paw-background' : 'text-paw-muted'
            }`}
            key={tab.value}
            onClick={() => setFeed(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {feed === 'all' && (
        <button
          className="w-full rounded-xl border border-paw-border bg-paw-background p-4 text-left shadow-sm disabled:opacity-50"
          disabled={petLoading || !pet}
          onClick={() => openComposer(`#今日话题 ${todayTopic}\n\n`)}
          type="button"
        >
          <div className="flex gap-3">
            <span className="mt-0.5 h-auto w-1 rounded-full bg-paw-primary" />
            <div>
              <p className="text-xs font-semibold text-paw-primary">🔥 今日话题</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-paw-secondary">{todayTopic}</p>
            </div>
          </div>
        </button>
      )}

      <CommunityFeed
        canCreatePost={!petLoading && Boolean(pet)}
        emptyText={feed === 'following' ? '还没有关注的宠物动态，来发一条自己的日常吧。' : '还没有动态，来发第一条吧'}
        loading={loading}
        onCommentAdded={bumpCommentCount}
        onCreatePost={() => openComposer()}
        onFollowPet={toggleFollowPet}
        onLike={toggleLike}
        posts={posts}
        userId={user?.id}
      />

      <PostComposer
        initialContent={composerInitialContent}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleCreatePost}
        open={composerOpen}
        pet={pet}
        saving={saving}
      />

      <button
        aria-label="发布动态"
        className="fixed bottom-[96px] right-5 z-40 flex items-center justify-center rounded-full bg-paw-primary text-3xl leading-none text-paw-background shadow-[0_4px_16px_rgba(44,24,16,0.3)] disabled:opacity-50"
        disabled={petLoading || !pet}
        onClick={() => openComposer()}
        style={{ height: 52, width: 52 }}
        type="button"
      >
        +
      </button>
    </div>
  );
}

export default Community;
