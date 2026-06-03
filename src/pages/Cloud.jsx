import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CommunityFeed from '../components/CommunityFeed.jsx';
import PetSwitcher from '../components/PetSwitcher.jsx';
import PostComposer from '../components/PostComposer.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useCommunityPosts } from '../hooks/useCommunityPosts.js';
import { usePets } from '../hooks/usePets.js';

function Cloud() {
  const location = useLocation();
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
  } = useCommunityPosts({ postType: 'cloud_walk' });
  const stickerDraft = useMemo(() => location.state || {}, [location.state]);
  const stickerDraftImages = useMemo(
    () => (stickerDraft.stickerImageUrl ? [stickerDraft.stickerImageUrl] : []),
    [stickerDraft.stickerImageUrl],
  );

  useEffect(() => {
    if (stickerDraft.stickerId) setComposerOpen(true);
  }, [stickerDraft.stickerId]);

  const handleCreatePost = async ({ content, files, imageUrls, publishPet }) => {
    await createPost({ content, files, imageUrls, pet, publishPet, type: 'cloud_walk' });
    setComposerOpen(false);
  };

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-paw-muted">云遛宠</p>
          <h1 className="mt-2 font-title text-3xl font-semibold">云遛宠频道</h1>
          <p className="mt-2 text-sm text-paw-muted">分享散步、晒太阳、玩耍和日常陪伴。</p>
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
          创建宠物档案后才能发布云遛宠内容。
        </section>
      )}

      <PetSwitcher activePetId={activePetId} label="发布身份" onSelectPet={selectPet} pets={pets} />

      <CommunityFeed
        emptyText="云遛宠频道还没有动态。"
        loading={loading}
        onCommentAdded={bumpCommentCount}
        onFollowPet={toggleFollowPet}
        onLike={toggleLike}
        posts={posts}
        userId={user?.id}
      />

      <PostComposer
        initialContent={stickerDraft.defaultContent || ''}
        initialImageUrls={stickerDraftImages}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleCreatePost}
        open={composerOpen}
        pet={pet}
        saving={saving}
        type="cloud_walk"
      />
    </div>
  );
}

export default Cloud;
