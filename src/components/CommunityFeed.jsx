import CommunityPostCard from './CommunityPostCard.jsx';

function CommunityFeed({ emptyText, loading, onCommentAdded, onFollowPet, onLike, posts, userId }) {
  if (loading) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-5 text-sm text-paw-muted">
        正在加载社区内容...
      </section>
    );
  }

  if (!posts.length) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-5 text-center">
        <div className="text-4xl">🐾</div>
        <p className="mt-3 text-sm text-paw-muted">{emptyText}</p>
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
