import { useState } from 'react';
import PostComments from './PostComments.jsx';

function PetAvatar({ pet }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-card border border-paw-border bg-paw-background text-2xl">
      {pet?.avatar_url ? (
        <img className="h-full w-full object-cover" src={pet.avatar_url} alt={pet.name} />
      ) : (
        pet?.avatar || '🐾'
      )}
    </div>
  );
}

function CommunityPostCard({ onCommentAdded, onFollowPet, onLike, post, userId }) {
  const pet = post.pets;
  const ownPet = pet?.user_id === userId;
  const [showComments, setShowComments] = useState(false);
  const [likeBouncing, setLikeBouncing] = useState(false);

  const handleLike = () => {
    if (!post.liked) {
      setLikeBouncing(true);
      window.setTimeout(() => setLikeBouncing(false), 320);
    }
    onLike(post);
  };

  return (
    <article className="rounded-card border border-paw-border bg-paw-card p-5">
      <div className="flex items-start gap-3">
        <PetAvatar pet={pet} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">{pet?.name || '匿名宠物'}</h2>
              <p className="mt-1 text-xs text-paw-muted">
                {pet ? `${pet.species} · ${pet.breed || '未填写品种'}` : '宠物档案未公开'}
              </p>
            </div>
            {pet && !ownPet && (
              <button
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  post.followed ? 'bg-paw-background text-paw-muted' : 'bg-paw-healthy/10 text-paw-healthy'
                }`}
                onClick={() => onFollowPet(post)}
                type="button"
              >
                {post.followed ? '已关注' : '关注'}
              </button>
            )}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-paw-secondary">{post.content}</p>
        </div>
      </div>

      {post.images?.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {post.images.map((image) => (
            <img className="aspect-square rounded-control object-cover" key={image} src={image} alt="社区帖子图片" />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-paw-border pt-3 text-xs text-paw-muted">
        <span>{new Date(post.created_at).toLocaleString('zh-CN', { month: 'short', day: 'numeric' })}</span>
        <div className="flex gap-2">
          <button
            className="rounded-full bg-paw-background px-3 py-1 font-semibold text-paw-muted"
            onClick={() => setShowComments((current) => !current)}
            type="button"
          >
            {(post.comments_count || 0) > 0 ? `评论 ${post.comments_count}` : '来说说 💬'}
          </button>
          <button
            className={`rounded-full px-3 py-1 font-semibold ${
              post.liked ? 'bg-paw-danger/10 text-paw-danger' : 'bg-paw-background text-paw-muted'
            } ${likeBouncing ? 'animate-like-bounce' : ''}`}
            onClick={handleLike}
            type="button"
          >
            <span aria-hidden="true">{post.liked ? '❤️' : '♥'}</span> {post.likes_count || 0}
          </button>
        </div>
      </div>

      {showComments && (
        <PostComments onCommentAdded={() => onCommentAdded(post.id)} post={post} userId={userId} />
      )}
    </article>
  );
}

export default CommunityPostCard;
