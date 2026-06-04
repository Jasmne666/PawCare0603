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

function Community() {
  const [feed, setFeed] = useState('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const { user } = useAuth();
  const { activePetId, loading: petLoading, pet, pets, selectPet } = usePets();
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
          onClick={() => setComposerOpen(true)}
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

      <section className="rounded-card border border-paw-healthy/30 bg-paw-healthy/10 p-4">
        <p className="text-xs font-semibold text-paw-healthy">今日话题</p>
        <h2 className="mt-1 text-sm font-semibold text-paw-primary">今天你家宠物做了什么可爱的事？</h2>
        <button
          className="mt-3 rounded-control bg-paw-card px-3 py-2 text-xs font-semibold text-paw-secondary"
          disabled={petLoading || !pet}
          onClick={() => setComposerOpen(true)}
          type="button"
        >
          用这个话题发一条
        </button>
      </section>

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

      <CommunityFeed
        emptyText={feed === 'following' ? '还没有关注的宠物动态。' : '社区还没有动态，发布第一条吧。'}
        loading={loading}
        onCommentAdded={bumpCommentCount}
        onFollowPet={toggleFollowPet}
        onLike={toggleLike}
        posts={posts}
        userId={user?.id}
      />

      <PostComposer
        onClose={() => setComposerOpen(false)}
        onSubmit={handleCreatePost}
        open={composerOpen}
        pet={pet}
        saving={saving}
      />

      <button
        aria-label="发布动态"
        className="fixed bottom-24 left-1/2 z-40 flex h-14 w-14 translate-x-[150px] items-center justify-center rounded-full bg-paw-primary text-3xl leading-none text-paw-background shadow-xl disabled:opacity-50 max-[430px]:translate-x-[125px]"
        disabled={petLoading || !pet}
        onClick={() => setComposerOpen(true)}
        type="button"
      >
        +
      </button>
    </div>
  );
}

export default Community;
