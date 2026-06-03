import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

export function usePostComments(postId) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('comments')
        .select('id, post_id, user_id, parent_comment_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (queryError) throw queryError;
      setComments(data ?? []);
    } catch (err) {
      setError(err.message || '读取评论失败');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = useCallback(
    async ({ content, parentCommentId = null }) => {
      if (!user) throw new Error('请先登录');
      if (!content.trim()) throw new Error('请输入评论内容');

      setSaving(true);
      setError('');

      try {
        const { data, error: insertError } = await supabase
          .from('comments')
          .insert({
            post_id: postId,
            user_id: user.id,
            parent_comment_id: parentCommentId,
            content: content.trim(),
          })
          .select('id, post_id, user_id, parent_comment_id, content, created_at')
          .single();

        if (insertError) throw insertError;
        setComments((current) => [...current, data]);
        return data;
      } catch (err) {
        const message = err.message || '评论失败';
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [postId, user],
  );

  return useMemo(
    () => ({
      addComment,
      comments,
      error,
      loadComments,
      loading,
      saving,
    }),
    [addComment, comments, error, loadComments, loading, saving],
  );
}
