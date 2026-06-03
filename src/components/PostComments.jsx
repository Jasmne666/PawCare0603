import { useMemo, useState } from 'react';
import { usePostComments } from '../hooks/usePostComments.js';

function getCommentAuthor(comment, post, userId) {
  if (comment.user_id === userId) return comment.user_id === post.user_id ? '我 · 作者' : '我';
  if (comment.user_id === post.user_id) return '作者';
  return '用户';
}

function CommentItem({ comment, onReply, post, replies, userId }) {
  return (
    <div className="rounded-control bg-paw-background p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-paw-secondary">
          {getCommentAuthor(comment, post, userId)}
        </span>
        <button
          className="text-xs font-semibold text-paw-healthy"
          onClick={() => onReply(comment)}
          type="button"
        >
          回复
        </button>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-paw-secondary">{comment.content}</p>

      {replies.length > 0 && (
        <div className="mt-2 space-y-2 border-l-2 border-paw-border pl-3">
          {replies.map((reply) => (
            <div key={reply.id}>
              <span className="text-xs font-semibold text-paw-muted">
                {getCommentAuthor(reply, post, userId)}
              </span>
              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-paw-secondary">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PostComments({ onCommentAdded, post, userId }) {
  const { addComment, comments, error, loading, saving } = usePostComments(post.id);
  const [content, setContent] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);

  const groupedComments = useMemo(() => {
    const rootComments = comments.filter((comment) => !comment.parent_comment_id);
    const repliesByParent = comments.reduce((map, comment) => {
      if (!comment.parent_comment_id) return map;
      const replies = map.get(comment.parent_comment_id) || [];
      map.set(comment.parent_comment_id, [...replies, comment]);
      return map;
    }, new Map());
    return { repliesByParent, rootComments };
  }, [comments]);

  const handleSubmit = async () => {
    try {
      const savedComment = await addComment({
        content,
        parentCommentId: replyTarget?.id || null,
      });
      setContent('');
      setReplyTarget(null);
      onCommentAdded(savedComment);
    } catch {
      // 错误已由 hook 写入 error 状态。
    }
  };

  return (
    <section className="mt-4 border-t border-paw-border pt-4">
      {loading ? (
        <p className="text-xs text-paw-muted">正在加载评论...</p>
      ) : (
        <div className="space-y-2">
          {groupedComments.rootComments.map((comment) => (
            <CommentItem
              comment={comment}
              key={comment.id}
              onReply={setReplyTarget}
              post={post}
              replies={groupedComments.repliesByParent.get(comment.id) || []}
              userId={userId}
            />
          ))}
          {!comments.length && <p className="text-xs text-paw-muted">还没有评论。</p>}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-paw-danger">{error}</p>}

      {replyTarget && (
        <div className="mt-3 flex items-center justify-between rounded-control bg-paw-healthy/10 px-3 py-2 text-xs text-paw-healthy">
          <span>回复：{replyTarget.content.slice(0, 18)}</span>
          <button onClick={() => setReplyTarget(null)} type="button">
            取消
          </button>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-control border border-paw-border bg-paw-card px-3 py-2 text-xs outline-none focus:border-paw-healthy"
          onChange={(event) => setContent(event.target.value)}
          placeholder={replyTarget ? '写一条回复...' : '写一条评论...'}
          value={content}
        />
        <button
          className="rounded-control bg-paw-primary px-3 py-2 text-xs font-semibold text-paw-background disabled:opacity-60"
          disabled={saving}
          onClick={handleSubmit}
          type="button"
        >
          {saving ? '发送中' : '发送'}
        </button>
      </div>
    </section>
  );
}

export default PostComments;
