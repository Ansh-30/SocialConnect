import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, Edit3, BookmarkCheck } from 'lucide-react';
import { fmtCount, timeAgo } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function PostCard({ post, onRemove }) {
  const { user }          = useSelector(s => s.auth);
  const navigate          = useNavigate();
  const [liked, setLiked] = useState(post.likes?.map(String).includes(user?._id));
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [saved, setSaved] = useState(user?.savedPosts?.map(String).includes(post._id));
  const [menu,  setMenu]  = useState(false);

  const isOwner = post.user?._id === user?._id || post.user === user?._id;

  const like = async () => {
    const prev = liked;
    setLiked(!prev); setLikes(l => l + (prev ? -1 : 1));
    try {
      const r = await api.post(`/posts/like/${post._id}`);
      setLiked(r.data.isLiked); setLikes(r.data.likesCount);
    } catch { setLiked(prev); setLikes(l => l + (prev ? 1 : -1)); }
  };

  const save = async () => {
    const prev = saved; setSaved(!prev);
    try {
      await api.post(`/users/save/${post._id}`);
      toast.success(prev ? 'Post unsaved' : 'Post saved!');
    } catch { setSaved(prev); toast.error('Failed'); }
  };

  const share = async () => {
    try {
      await api.post(`/posts/share/${post._id}`);
      await navigator.clipboard.writeText(`${location.origin}/post/${post._id}`);
      toast.success('Link copied!');
    } catch { toast.error('Failed to copy'); }
  };

  const del = async () => {
    if (!confirm('Delete this post?')) return;
    try { await api.delete(`/posts/${post._id}`); onRemove?.(post._id); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
    setMenu(false);
  };

  return (
    <article className="card-hover p-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Link to={`/profile/${post.user?.username}`} className="flex items-center gap-3 group">
          <Avatar user={post.user} size={10} />
          <div>
            <span className="font-semibold text-sm text-[--text-1] group-hover:text-ink-400 transition-colors">
              {post.user?.name}
              {post.user?.isVerified && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-ink-400 rounded-full">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </span>
              )}
            </span>
            <p className="text-xs text-[--text-3]">@{post.user?.username} · {timeAgo(post.createdAt)}</p>
          </div>
        </Link>

        {/* Context menu */}
        <div className="relative">
          <button onClick={() => setMenu(!menu)} className="btn-ghost p-1.5">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {menu && (
            <div className="absolute right-0 top-9 w-44 card border-[--border] shadow-xl z-20 overflow-hidden animate-scale-in">
              <div className="p-1.5 space-y-0.5">
                {isOwner && (
                  <>
                    <button onClick={() => { navigate(`/post/${post._id}`); setMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[--text-2] hover:bg-[--surface-2] transition-colors">
                      <Edit3 className="w-4 h-4" /> Edit Post
                    </button>
                    <button onClick={del}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </>
                )}
                <button onClick={() => { share(); setMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[--text-2] hover:bg-[--surface-2] transition-colors">
                  <Share2 className="w-4 h-4" /> Copy Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="text-sm text-[--text-1] leading-relaxed whitespace-pre-line mb-3">{post.caption}</p>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map(t => (
            <Link key={t} to={`/search?q=%23${t}`} className="tag text-xs">#{t}</Link>
          ))}
        </div>
      )}

      {/* Image */}
{post.image && (
  <Link to={`/post/${post._id}`} className="block mb-3">
    <img
      src={`http://localhost:5001${post.image}`}
      alt="Post"
      className="w-full rounded-xl object-cover max-h-[500px] hover:opacity-97 transition-opacity"
      loading="lazy"
    />
  </Link>
)}
      {/* Actions */}
      <div className="flex items-center gap-0.5 pt-3 border-t border-[--border]">
        <button onClick={like} className={`post-btn ${liked ? '!text-red-500' : ''}`}>
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          {fmtCount(likes)}
        </button>

        <Link to={`/post/${post._id}`} className="post-btn">
          <MessageCircle className="w-5 h-5" />
          {fmtCount(post.comments?.length || 0)}
        </Link>

        <button onClick={share} className="post-btn">
          <Share2 className="w-5 h-5" />
          {fmtCount(post.shares || 0)}
        </button>

        <button onClick={save} className={`post-btn ml-auto ${saved ? '!text-ink-400' : ''}`}>
          {saved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>
    </article>
  );
}
