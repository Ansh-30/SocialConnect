import { useEffect, useState } from 'react';
import {
  useParams,
  useNavigate,
  Link,
} from 'react-router-dom';

import { useSelector } from 'react-redux';

import api from '../utils/api';

import Avatar from '../components/common/Avatar';
import CommentSection from '../components/comments/CommentSection';

import {
  PageLoader,
} from '../components/common/Loaders';

import {
  Heart,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Edit3,
  Trash2,
  Loader2,
} from 'lucide-react';

import {
  fmtCount,
  timeAgo,
} from '../utils/helpers';

import toast from 'react-hot-toast';

export default function PostDetail() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { user: me } = useSelector(
    (state) => state.auth
  );

  const [post, setPost] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [liked, setLiked] =
    useState(false);

  const [likes, setLikes] =
    useState(0);

  const [saved, setSaved] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [caption, setCaption] =
    useState('');

  const [tags, setTags] =
    useState('');

  const [saving, setSaving] =
    useState(false);


  // ─────────────────────────────────────────────
  // Fetch Post
  // ─────────────────────────────────────────────

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {

    setLoading(true);

    try {

      const response =
        await api.get(`/posts/${id}`);

      const p = response.data.post;

      setPost(p);

      setLiked(
        p.likes?.map(String).includes(me?._id)
      );

      setLikes(p.likes?.length || 0);

      setSaved(
        me?.savedPosts
          ?.map(String)
          .includes(p._id)
      );

      setCaption(p.caption || '');

      setTags((p.tags || []).join(', '));

    } catch (error) {

      toast.error('Post not found');

      navigate('/');
    }

    finally {
      setLoading(false);
    }
  };


  // ─────────────────────────────────────────────
  // Like Post
  // ─────────────────────────────────────────────

  const toggleLike = async () => {

    const previous = liked;

    setLiked(!previous);

    setLikes((l) =>
      l + (previous ? -1 : 1)
    );

    try {

      const response =
        await api.post(`/posts/like/${id}`);

      setLiked(response.data.isLiked);

      setLikes(response.data.likesCount);

    } catch {

      setLiked(previous);

      setLikes((l) =>
        l + (previous ? 1 : -1)
      );
    }
  };


  // ─────────────────────────────────────────────
  // Save Post
  // ─────────────────────────────────────────────

  const toggleSave = async () => {

    const previous = saved;

    setSaved(!previous);

    try {

      await api.post(`/users/save/${id}`);

      toast.success(
        previous
          ? 'Post Unsaved'
          : 'Post Saved'
      );

    } catch {

      setSaved(previous);

      toast.error('Failed to save');
    }
  };


  // ─────────────────────────────────────────────
  // Share Post
  // ─────────────────────────────────────────────

  const sharePost = async () => {

    try {

      await api.post(`/posts/share/${id}`);

      await navigator.clipboard.writeText(
        window.location.href
      );

      toast.success('Link copied');

    } catch {

      toast.error('Failed to share');
    }
  };


  // ─────────────────────────────────────────────
  // Save Edited Post
  // ─────────────────────────────────────────────

  const saveEdit = async () => {

    setSaving(true);

    try {

      const response =
        await api.put(`/posts/${id}`, {
          caption,
          tags,
        });

      setPost(response.data.post);

      setEditing(false);

      toast.success('Post updated');

    } catch {

      toast.error('Failed to update');
    }

    finally {
      setSaving(false);
    }
  };


  // ─────────────────────────────────────────────
  // Delete Post
  // ─────────────────────────────────────────────

  const deletePost = async () => {

    const confirmed =
      window.confirm(
        'Delete this post?'
      );

    if (!confirmed) return;

    try {

      await api.delete(`/posts/${id}`);

      toast.success('Post deleted');

      navigate('/');

    } catch {

      toast.error('Failed to delete');
    }
  };


  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────

  if (loading) {
    return <PageLoader />;
  }

  if (!post) {
    return null;
  }

  const isOwner =
    post.user?._id === me?._id;


  return (
    <div className="space-y-4 animate-fade-up">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost pl-0 text-[--text-3]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>


      {/* Post Card */}
      <div className="card p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">

          <Link
            to={`/profile/${post.user?.username}`}
            className="flex items-center gap-3 group"
          >

            <Avatar
              user={post.user}
              size={11}
            />

            <div>

              <p className="font-semibold text-[--text-1] group-hover:text-ink-400 transition-colors">
                {post.user?.name}
              </p>

              <p className="text-xs text-[--text-3]">
                @{post.user?.username} •{' '}
                {timeAgo(post.createdAt)}
              </p>

            </div>
          </Link>


          {/* Owner Actions */}
          {isOwner && (
            <div className="flex gap-2">

              <button
                onClick={() =>
                  setEditing(!editing)
                }
                className="btn-ghost py-1.5 px-3 text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />

                {editing
                  ? 'Cancel'
                  : 'Edit'}
              </button>

              <button
                onClick={deletePost}
                className="btn-ghost py-1.5 px-3 text-xs text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>


        {/* Edit Form */}
        {editing ? (

          <div className="space-y-3 mb-4">

            <textarea
              value={caption}
              onChange={(e) =>
                setCaption(e.target.value)
              }
              rows={4}
              maxLength={2200}
              placeholder="Write caption..."
              className="field resize-none"
            />

            <input
              value={tags}
              onChange={(e) =>
                setTags(e.target.value)
              }
              placeholder="Tags: react, social"
              className="field"
            />

            <div className="flex gap-2">

              <button
                onClick={saveEdit}
                disabled={saving}
                className="btn-primary py-2 px-4"
              >

                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Edit3 className="w-4 h-4" />
                )}

                Save Changes
              </button>

              <button
                onClick={() =>
                  setEditing(false)
                }
                className="btn-outline py-2 px-4"
              >
                Cancel
              </button>
            </div>
          </div>

        ) : (

          <>
            {/* Caption */}
            {post.caption && (
              <p className="text-[--text-1] leading-relaxed whitespace-pre-line mb-4">
                {post.caption}
              </p>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (

              <div className="flex flex-wrap gap-2 mb-4">

                {post.tags.map((tag) => (

                  <Link
                    key={tag}
                    to={`/search?q=%23${tag}`}
                    className="tag"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}


        {/* Post Image */}
        {post.image && (

          <img
            src={
              post.image.startsWith('http')
                ? post.image
                : `https://socialconnect-backend-czfw.onrender.com${post.image}`
            }

            alt="Post"

            className="w-full rounded-2xl object-cover max-h-[650px] mb-4 border border-[--border] shadow-lg"

            loading="lazy"

            onError={(e) => {

              console.log(
                '❌ Image failed:',
                post.image
              );

              e.target.src =
                'https://placehold.co/800x500?text=Image+Unavailable';
            }}
          />
        )}


        {/* Actions */}
        <div className="flex items-center gap-1 pt-4 border-t border-[--border]">

          {/* Like */}
          <button
            onClick={toggleLike}
            className={`post-btn ${
              liked
                ? '!text-red-500'
                : ''
            }`}
          >

            <Heart
              className={`w-5 h-5 ${
                liked
                  ? 'fill-current'
                  : ''
              }`}
            />

            {fmtCount(likes)} Likes
          </button>


          {/* Share */}
          <button
            onClick={sharePost}
            className="post-btn"
          >

            <Share2 className="w-5 h-5" />

            {fmtCount(post.shares || 0)}
            Shares
          </button>


          {/* Save */}
          <button
            onClick={toggleSave}
            className={`post-btn ml-auto ${
              saved
                ? '!text-ink-400'
                : ''
            }`}
          >

            {saved ? (
              <BookmarkCheck className="w-5 h-5 fill-current" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}

            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>


      {/* Comments */}
      <div className="card p-6">

        <h3 className="font-display font-bold text-[--text-1] mb-5">

          Comments (
          {post.comments?.length || 0}
          )

        </h3>

        <CommentSection
          postId={post._id}
          initialComments={
            post.comments || []
          }
        />
      </div>
    </div>
  );
}