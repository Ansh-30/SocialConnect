import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Avatar from '../common/Avatar';
import { Hash, TrendingUp, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RightPanel() {
  const [suggestions, setSuggestions] = useState([]);
  const [tags,        setTags]        = useState([]);
  const [following,   setFollowing]   = useState(new Set());

  useEffect(() => {
    api.get('/users/suggestions').then(r => setSuggestions(r.data.users || [])).catch(() => {});
    api.get('/search?q=a&type=tags').then(r => setTags(r.data.results?.tags?.slice(0, 10) || [])).catch(() => {});
  }, []);

  const follow = async id => {
    try {
      const r = await api.post(`/users/follow/${id}`);
      setFollowing(prev => {
        const s = new Set(prev);
        r.data.isFollowing ? s.add(id) : s.delete(id);
        return s;
      });
      toast.success(r.data.isFollowing ? 'Following!' : 'Unfollowed');
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-4">
      {/* Who to follow */}
      {suggestions.length > 0 && (
        <div className="card p-4">
          <h3 className="flex items-center gap-2 font-display font-semibold text-sm text-[--text-1] mb-4">
            <UserPlus className="w-4 h-4 text-ink-400" />
            Who to Follow
          </h3>
          <div className="space-y-3">
            {suggestions.map(u => (
              <div key={u._id} className="flex items-center gap-3">
                <Link to={`/profile/${u.username}`}>
                  <Avatar user={u} size={9} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${u.username}`} className="font-semibold text-sm text-[--text-1] hover:text-ink-400 truncate block transition-colors">
                    {u.name}
                  </Link>
                  <p className="text-xs text-[--text-3] truncate">@{u.username}</p>
                </div>
                <button
                  onClick={() => follow(u._id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    following.has(u._id)
                      ? 'bg-[--surface-2] text-[--text-2]'
                      : 'bg-ink-400 text-white hover:bg-ink-500'
                  }`}
                >
                  {following.has(u._id) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending tags */}
      {tags.length > 0 && (
        <div className="card p-4">
          <h3 className="flex items-center gap-2 font-display font-semibold text-sm text-[--text-1] mb-4">
            <TrendingUp className="w-4 h-4 text-pop-pink" />
            Trending Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link key={tag} to={`/search?q=%23${tag}`} className="tag">
                <Hash className="w-3 h-3" />{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[--text-3] px-1">© 2026 SocialConnect</p>
    </div>
  );
}
