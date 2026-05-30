import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/posts/PostCard';
import { Search, Users, FileText, Hash, Loader2 } from 'lucide-react';

const TYPES = [
  { key: 'all',   label: 'All',   icon: Search },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'posts', label: 'Posts', icon: FileText },
  { key: 'tags',  label: 'Tags',  icon: Hash },
];

export default function SearchPage() {
  const [sp, setSp]             = useSearchParams();
  const [query, setQuery]       = useState(sp.get('q') || '');
  const [type,  setType]        = useState(sp.get('type') || 'all');
  const [results, setResults]   = useState({});
  const [loading, setLoading]   = useState(false);
  const [posts, setPosts]       = useState([]);

  useEffect(() => {
    const q = sp.get('q') || '';
    const t = sp.get('type') || 'all';
    setQuery(q); setType(t);
    if (q.trim()) doSearch(q, t);
  }, [sp]);

  const doSearch = async (q, t) => {
    setLoading(true);
    try {
      const r = await api.get(`/search?q=${encodeURIComponent(q)}&type=${t}`);
      setResults(r.data.results);
      setPosts(r.data.results.posts || []);
    } catch {}
    finally { setLoading(false); }
  };

  const submit = e => {
    e.preventDefault();
    if (query.trim()) setSp({ q: query.trim(), type });
  };

  const removePost = id => setPosts(prev => prev.filter(p => p._id !== id));

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Search form */}
      <div className="card p-4">
        <form onSubmit={submit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-3]" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search users, posts, #tags…"
              className="field pl-9 w-full" />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
        </form>
      </div>

      {/* Type tabs */}
      {query && (
        <div className="card p-1.5 flex gap-1">
          {TYPES.map(({ key, label, icon: Icon }) => (
            <button key={key}
              onClick={() => setSp({ q: query, type: key })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                type === key ? 'bg-ink-400 text-white' : 'text-[--text-3] hover:bg-[--surface-2]'
              }`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-ink-400" /></div>
      )}

      {/* Results */}
      {!loading && query && (
        <>
          {/* Users */}
          {(type === 'all' || type === 'users') && results.users?.length > 0 && (
            <div className="card divide-y divide-[--border]">
              <div className="px-5 py-3">
                <h3 className="font-display font-semibold text-sm text-[--text-1] flex items-center gap-2">
                  <Users className="w-4 h-4 text-ink-400" /> Users
                </h3>
              </div>
              {results.users.map(u => (
                <Link key={u._id} to={`/profile/${u.username}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[--surface-2] transition-colors">
                  <Avatar user={u} size={11} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[--text-1] truncate">{u.name}</p>
                    <p className="text-xs text-[--text-3]">@{u.username}</p>
                    {u.bio && <p className="text-xs text-[--text-2] mt-0.5 truncate">{u.bio}</p>}
                  </div>
                  <span className="text-xs text-[--text-3]">{u.followers?.length || 0} followers</span>
                </Link>
              ))}
            </div>
          )}

          {/* Tags */}
          {(type === 'all' || type === 'tags') && results.tags?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-semibold text-sm text-[--text-1] flex items-center gap-2 mb-4">
                <Hash className="w-4 h-4 text-ink-400" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.tags.map(t => (
                  <Link key={t} to={`/search?q=%23${t}&type=tags`} className="tag text-sm px-3 py-1.5">
                    #{t}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          {(type === 'all' || type === 'posts') && posts.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-sm text-[--text-1] flex items-center gap-2 px-1">
                <FileText className="w-4 h-4 text-ink-400" /> Posts
              </h3>
              {posts.map(p => <PostCard key={p._id} post={p} onRemove={removePost} />)}
            </div>
          )}

          {/* No results */}
          {!loading && Object.values(results).every(r => !r?.length) && (
            <div className="card p-12 text-center">
              <Search className="w-10 h-10 text-[--text-3] mx-auto mb-3" />
              <p className="font-semibold text-[--text-1] mb-1">No results for "{query}"</p>
              <p className="text-sm text-[--text-3]">Try different keywords or check the spelling</p>
            </div>
          )}
        </>
      )}

      {/* Empty */}
      {!query && !loading && (
        <div className="card p-14 text-center">
          <Search className="w-12 h-12 text-[--text-3] mx-auto mb-4" />
          <p className="font-display font-bold text-[--text-1] mb-2">Discover SocialConnect</p>
          <p className="text-sm text-[--text-3]">Search for people, posts, or hashtags</p>
        </div>
      )}
    </div>
  );
}
