import CommunityPostCard from './CommunityPostCard.jsx';

function CommunityFeed({
  canCreatePost = true,
  emptyText,
  loading,
  onCommentAdded,
  onCreatePost,
  onFollowPet,
  onLike,
  posts,
  userId,
}) {
  if (loading) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-5 text-sm text-paw-muted">
        正在加载社区内容...
      </section>
    );
  }

  if (!posts.length) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card px-5 py-8 text-center">
        <div className="text-[48px] leading-none">🐾</div>
        <p className="mt-4 text-sm font-medium text-paw-muted">{emptyText}</p>
        <button
          className="mt-5 rounded-control bg-paw-primary px-5 py-2.5 text-sm font-semibold text-paw-background disabled:opacity-50"
          disabled={!canCreatePost}
          onClick={onCreatePost}
          type="button"
        >
          去发布
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <CommunityPostCard
          key={post.id}
          onCommentAdded={onCommentAdded}
          onFollowPet={onFollowPet}
          onLike={onLike}
          post={post}
          userId={userId}
        />
      ))}
    </div>
  );
}

export default CommunityFeed;
