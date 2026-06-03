import { useCallback, useEffect, useMemo, useState } from 'react';
import { uploadPostImages } from '../lib/communityStorage.js';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

function toPost(row, likedIds, followedPetIds) {
  return {
    ...row,
    liked: likedIds.has(row.id),
    followed: row.pet_id ? followedPetIds.has(row.pet_id) : false,
  };
}

export function useCommunityPosts({ feed = 'all', postType = 'normal' } = {}) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async () => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('posts')
        .select(
          'id,user_id,pet_id,content,images,post_type,likes_count,comments_count,created_at,pets(id,name,species,breed,avatar,avatar_url,is_public,user_id)',
        )
        .eq('post_type', postType)
        .order('created_at', { ascending: false })
        .limit(60);
      if (queryError) throw queryError;
      const rows = data ?? [];
      const postIds = rows.map((post) => post.id);
      const petIds = rows.map((post) => post.pet_id).filter(Boolean);
      const likedIds = new Set();
      const followedPetIds = new Set();
      if (postIds.length) {
        const { data: likes, error: likesError } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        if (likesError) throw likesError;
        likes?.forEach((like) => likedIds.add(like.post_id));
      }
      if (petIds.length) {
        const { data: follows, error: followsError } = await supabase
          .from('pet_follows')
          .select('following_pet_id')
          .eq('follower_id', user.id)
          .in('following_pet_id', petIds);
        if (followsError) throw followsError;
        follows?.forEach((follow) => followedPetIds.add(follow.following_pet_id));
      }
      const nextPosts = rows
        .map((post) => toPost(post, likedIds, followedPetIds))
        .filter((post) => feed !== 'following' || post.followed || post.user_id === user.id);
      setPosts(nextPosts);
    } catch (err) {
      setError(err.message || '读取社区内容失败');
    } finally {
      setLoading(false);
    }
  }, [feed, postType, user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const createPost = useCallback(
    async ({ content, files, pet, publishPet = true, type = postType }) => {
      if (!user) throw new Error('请先登录');
      if (!content.trim()) throw new Error('请输入帖子内容');
      setSaving(true);
      setError('');

      try {
        if (publishPet && pet?.id && !pet.is_public) {
          await supabase.from('pets').update({ is_public: true }).eq('id', pet.id);
        }
        const imageUrls = await uploadPostImages(files, user.id);
        const { error: insertError } = await supabase.from('posts').insert({
          user_id: user.id,
          pet_id: pet?.id ?? null,
          content: content.trim(),
          images: imageUrls,
          post_type: type,
        });
        if (insertError) throw insertError;
        await loadPosts();
      } catch (err) {
        const message = err.message || '发布失败';
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadPosts, postType, user],
  );

  const toggleLike = useCallback(
    async (post) => {
      if (!user) return;
      const nextLiked = !post.liked;
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                liked: nextLiked,
                likes_count: Math.max((item.likes_count || 0) + (nextLiked ? 1 : -1), 0),
              }
            : item,
        ),
      );

      try {
        if (nextLiked) {
          const { error: likeError } = await supabase
            .from('post_likes')
            .insert({ post_id: post.id, user_id: user.id });
          if (likeError) throw likeError;
        } else {
          const { error: unlikeError } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', post.id)
            .eq('user_id', user.id);
          if (unlikeError) throw unlikeError;
        }
      } catch (err) {
        setError(err.message || '点赞失败');
        await loadPosts();
      }
    },
    [loadPosts, user],
  );

  const toggleFollowPet = useCallback(
    async (post) => {
      if (!user || !post.pet_id || post.pets?.user_id === user.id) return;
      const nextFollowed = !post.followed;
      setPosts((current) =>
        current.map((item) => (item.pet_id === post.pet_id ? { ...item, followed: nextFollowed } : item)),
      );

      try {
        if (nextFollowed) {
          const { error: followError } = await supabase
            .from('pet_follows')
            .insert({ follower_id: user.id, following_pet_id: post.pet_id });
          if (followError) throw followError;
        } else {
          const { error: unfollowError } = await supabase
            .from('pet_follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_pet_id', post.pet_id);
          if (unfollowError) throw unfollowError;
        }
      } catch (err) {
        setError(err.message || '关注失败');
        await loadPosts();
      }
    },
    [loadPosts, user],
  );

  const bumpCommentCount = useCallback((postId) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, comments_count: (post.comments_count || 0) + 1 } : post,
      ),
    );
  }, []);

  return useMemo(
    () => ({
      bumpCommentCount,
      createPost,
      error,
      loadPosts,
      loading,
      posts,
      saving,
      toggleFollowPet,
      toggleLike,
    }),
    [bumpCommentCount, createPost, error, loadPosts, loading, posts, saving, toggleFollowPet, toggleLike],
  );
}
