import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';
import { PageLoader } from '../components/common/Loaders';
import { Users, FileText, MessageCircle, TrendingUp, Shield, Trash2, UserCheck, UserX, ArrowLeft, Search } from 'lucide-react';
import { fmtCount, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';
import logo from "../assets/logo.png";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-[--text-1]">{fmtCount(value)}</p>
        <p className="text-xs text-[--text-3]">{label}</p>
      </div>
    </div>
  );
}

export default function Admin() {
  const [stats,       setStats]       = useState(null);
  const [users,       setUsers]       = useState([]);
  const [posts,       setPosts]       = useState([]);
  const [tab,         setTab]         = useState('overview');
  const [loading,     setLoading]     = useState(true);
  const [userSearch,  setUserSearch]  = useState('');
  const [userPage,    setUserPage]    = useState(1);
  const [userTotal,   setUserTotal]   = useState(0);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab, userSearch, userPage]);
  useEffect(() => { if (tab === 'posts') fetchPosts(); }, [tab]);

  const fetchStats = async () => {
    try { const r = await api.get('/admin/stats'); setStats(r.data); }
    catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const r = await api.get(`/admin/users?page=${userPage}&limit=15&search=${userSearch}`);
      setUsers(r.data.users); setUserTotal(r.data.pagination.total);
    } catch {}
  };

  const fetchPosts = async () => {
    try { const r = await api.get('/admin/posts?limit=20'); setPosts(r.data.posts); }
    catch {}
  };

  const toggleUser = async id => {
    try {
      const r = await api.put(`/admin/users/${id}/toggle-status`);
      setUsers(prev => prev.map(u => u._id === id ? r.data.user : u));
      toast.success(r.data.message);
    } catch { toast.error('Failed'); }
  };

  const deletePost = async id => {
    if (!confirm('Permanently delete this post?')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      setPosts(prev => prev.filter(p => p._id !== id));
      toast.success('Post deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <PageLoader />;

  const TABS = ['overview', 'users', 'posts'];

  return (
    <div className="min-h-screen surface-2">
      {/* Top bar */}
      <div className="surface border-b border-[--border] px-6 py-4 flex items-center gap-4">
        <Link to="/" className="btn-ghost pl-0 text-[--text-3]"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-[--text-1]">Admin Panel</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="card p-1.5 flex gap-1 w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                tab === t ? 'bg-amber-500 text-white' : 'text-[--text-3] hover:bg-[--surface-2]'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users}          label="Total Users"    value={stats.stats.totalUsers}    color="bg-ink-400" />
              <StatCard icon={FileText}       label="Total Posts"    value={stats.stats.totalPosts}    color="bg-emerald-500" />
              <StatCard icon={MessageCircle}  label="Comments"       value={stats.stats.totalComments} color="bg-pop-pink" />
              <StatCard icon={TrendingUp}     label="New Today"      value={stats.stats.newToday}      color="bg-amber-500" />
            </div>

            {/* Top posts */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-[--text-1] mb-4">Top Posts by Likes</h3>
              <div className="space-y-3">
                {(stats.topPosts || []).map((p, i) => (
                  <div key={p._id} className="flex items-center gap-4">
                    <span className="w-6 text-sm font-mono font-bold text-[--text-3]">#{i+1}</span>
                    <Avatar user={p.user} size={9} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[--text-1] truncate">{p.caption || '(no caption)'}</p>
                      <p className="text-xs text-[--text-3]">@{p.user?.username}</p>
                    </div>
                    <span className="text-sm font-bold text-red-500">♥ {fmtCount(p.likes?.length || 0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent users */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-[--text-1] mb-4">Recent Signups</h3>
              <div className="space-y-3">
                {(stats.recentUsers || []).map(u => (
                  <div key={u._id} className="flex items-center gap-3">
                    <Avatar user={u} size={9} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[--text-1] truncate">{u.name}</p>
                      <p className="text-xs text-[--text-3]">@{u.username}</p>
                    </div>
                    <span className="text-xs text-[--text-3]">{timeAgo(u.createdAt)}</span>
                    {u.role === 'admin' && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-600">Admin</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-3]" />
                <input value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                  placeholder="Search users by name, email, username…"
                  className="field pl-9 w-full" />
              </div>
            </div>
            <p className="text-sm text-[--text-3]">{userTotal} users total</p>
            <div className="card divide-y divide-[--border]">
              {users.map(u => (
                <div key={u._id} className="flex items-center gap-4 px-5 py-4">
                  <Avatar user={u} size={10} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-[--text-1] truncate">{u.name}</p>
                      {u.role === 'admin' && (
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600">Admin</span>
                      )}
                      {!u.isActive && (
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-red-500/15 text-red-500">Banned</span>
                      )}
                    </div>
                    <p className="text-xs text-[--text-3]">@{u.username} · {u.email}</p>
                    <p className="text-xs text-[--text-3]">Joined {timeAgo(u.createdAt)}</p>
                  </div>
                  {u.role !== 'admin' && (
                    <button onClick={() => toggleUser(u._id)}
                      className={`btn-sm ${u.isActive ? 'btn-outline text-red-500 hover:bg-red-500/10' : 'btn-outline text-emerald-500 hover:bg-emerald-500/10'}`}>
                      {u.isActive
                        ? <><UserX className="w-3.5 h-3.5" /> Deactivate</>
                        : <><UserCheck className="w-3.5 h-3.5" /> Activate</>
                      }
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="flex gap-2 justify-center">
              {userPage > 1 && (
                <button onClick={() => setUserPage(p => p - 1)} className="btn-outline btn-sm">← Prev</button>
              )}
              <span className="px-3 py-1.5 text-sm text-[--text-3]">Page {userPage}</span>
              {users.length === 15 && (
                <button onClick={() => setUserPage(p => p + 1)} className="btn-outline btn-sm">Next →</button>
              )}
            </div>
          </div>
        )}

        {/* Posts */}
        {tab === 'posts' && (
          <div className="space-y-4 animate-fade-up">
            <p className="text-sm text-[--text-3]">Showing latest {posts.length} posts (including deleted)</p>
            <div className="card divide-y divide-[--border]">
              {posts.map(p => (
                <div key={p._id} className="flex items-start gap-4 px-5 py-4">
                  <Avatar user={p.user} size={9} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[--text-1] line-clamp-2">{p.caption || '(image only)'}</p>
                    <p className="text-xs text-[--text-3] mt-1">
                      @{p.user?.username} · {timeAgo(p.createdAt)} · {p.likes?.length || 0} likes
                    </p>
                    {p.isDeleted && (
                      <span className="text-xs font-semibold text-red-500">Soft-deleted</span>
                    )}
                  </div>
                  {p.image && (
                    <img src={p.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  )}
                  <button onClick={() => deletePost(p._id)}
                    className="btn-ghost p-2 text-red-500 hover:bg-red-500/10 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
