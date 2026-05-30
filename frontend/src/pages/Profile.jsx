import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileThunk } from '../store/authSlice';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/posts/PostCard';
import { PageLoader } from '../components/common/Loaders';
import { Edit3, MapPin, Link2, Grid, Users, Camera, Loader2, Check, X } from 'lucide-react';
import { fmtCount } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Profile() {
  const { username }       = useParams();
  const { user: me }       = useSelector(s => s.auth);
  const dispatch           = useDispatch();
  const fileRef            = useRef(null);

  const [profile, setProfile]     = useState(null);
  const [posts,   setPosts]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [postsLoad, setPostsLoad] = useState(true);
  const [following, setFollowing] = useState(false);
  const [tab, setTab]             = useState('posts');

  // Edit state
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name: '', bio: '', website: '', location: '' });
  const [avatarFile, setAvatarFile]   = useState(null);
  const [avatarPrev, setAvatarPrev]   = useState(null);
  const [saving, setSaving]           = useState(false);

  const isOwn = me?.username === username;

  useEffect(() => { setLoading(true); fetchProfile(); }, [username]);

  const fetchProfile = async () => {
    try {
      const r = await api.get(`/users/by-username/${username}`);
      const u = r.data.user;
      setProfile(u);
      setFollowing(u.followers?.map(f => f._id || f).includes(me?._id));
      setForm({ name: u.name || '', bio: u.bio || '', website: u.website || '', location: u.location || '' });
      fetchPosts(u._id);
    } catch { toast.error('User not found'); }
    finally { setLoading(false); }
  };

  const fetchPosts = async (uid) => {
    setPostsLoad(true);
    try { const r = await api.get(`/users/${uid}/posts`); setPosts(r.data.posts); }
    catch {} finally { setPostsLoad(false); }
  };

  const toggleFollow = async () => {
    try {
      const r = await api.post(`/users/follow/${profile._id}`);
      setFollowing(r.data.isFollowing);
      setProfile(prev => ({
        ...prev,
        followers: r.data.isFollowing
          ? [...(prev.followers || []), { _id: me._id, name: me.name, username: me.username }]
          : (prev.followers || []).filter(f => (f._id || f) !== me._id),
      }));
    } catch { toast.error('Failed'); }
  };

  const pickAvatar = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Max 5 MB'); return; }
    setAvatarFile(f); setAvatarPrev(URL.createObjectURL(f));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      await dispatch(updateProfileThunk(fd)).unwrap();
      await fetchProfile();
      setEditing(false); setAvatarFile(null); setAvatarPrev(null);
      toast.success('Profile updated!');
    } catch (e) { toast.error(e || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;
  if (!profile) return <div className="card p-12 text-center text-[--text-3]">User not found</div>;

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-5">
          {/* Avatar */}
{editing ? (
  <label className="cursor-pointer group relative">
    {avatarPrev || profile.avatar ? (
      <img
        src={
          avatarPrev
            ? avatarPrev
            : `http://localhost:5001${profile.avatar}`
        }
        alt="Profile"
        className="w-20 h-20 rounded-full object-cover ring-2 ring-[--border]"
      />
    ) : (
      <Avatar user={profile} size={20} />
    )}

    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <Camera className="w-5 h-5 text-white" />
    </div>

    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={pickAvatar}
    />
  </label>
) : (
  <Avatar user={profile} size={20} />
)}
          {/* Actions */}
          {isOwn ? (
            editing ? (
              <div className="flex gap-2">
                <button onClick={saveProfile} disabled={saving} className="btn-primary py-2 px-4">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save
                </button>
                <button onClick={() => { setEditing(false); setAvatarPrev(null); }} className="btn-outline py-2 px-3">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-outline py-2 px-4">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            )
          ) : (
            <button onClick={toggleFollow} className={following ? 'btn-outline' : 'btn-primary'}>
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Info */}
        {editing ? (
          <div className="space-y-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="field" />
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Bio (max 200 chars)" rows={3} maxLength={200} className="field resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" className="field" />
              <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="Website" className="field" />
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-display font-bold text-xl text-[--text-1] mb-0.5 flex items-center gap-2">
              {profile.name}
              {profile.isVerified && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-ink-400 rounded-full">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </span>
              )}
            </h1>
            <p className="text-sm text-[--text-3] mb-3">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-[--text-2] mb-3 leading-relaxed">{profile.bio}</p>}
            <div className="flex flex-wrap gap-4 text-xs text-[--text-3] mb-4">
              {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.location}</span>}
              {profile.website  && (
                <a href={profile.website} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-ink-400 hover:underline">
                  <Link2 className="w-3.5 h-3.5" />{profile.website.replace(/https?:\/\//, '')}
                </a>
              )}
            </div>
          </>
        )}

        {/* Stats */}
        <div className="flex gap-6 pt-4 border-t border-[--border]">
          {[
            { label: 'Posts',     val: posts.length },
            { label: 'Followers', val: profile.followers?.length || 0 },
            { label: 'Following', val: profile.following?.length || 0 },
          ].map(({ label, val }) => (
            <div key={label} className="text-center">
              <p className="font-bold text-[--text-1]">{fmtCount(val)}</p>
              <p className="text-xs text-[--text-3]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-1.5 flex gap-1">
        {[
          { key: 'posts',     label: 'Posts',     icon: Grid },
          { key: 'followers', label: `Followers (${profile.followers?.length || 0})`, icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === key ? 'bg-ink-400 text-white' : 'text-[--text-3] hover:bg-[--surface-2]'
            }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'posts' && (
        postsLoad
          ? <div className="card p-8 text-center text-sm text-[--text-3]">Loading…</div>
          : posts.length === 0
            ? <div className="card p-12 text-center"><Grid className="w-10 h-10 text-[--text-3] mx-auto mb-3" /><p className="text-sm text-[--text-3]">No posts yet</p></div>
            : <div className="space-y-4">{posts.map(p => <PostCard key={p._id} post={p} onRemove={id => setPosts(prev => prev.filter(x => x._id !== id))} />)}</div>
      )}

      {tab === 'followers' && (
        <div className="card divide-y divide-[--border]">
          {(profile.followers || []).length === 0
            ? <div className="p-8 text-center text-sm text-[--text-3]">No followers yet</div>
            : (profile.followers || []).map(f => (
                <a key={f._id || f} href={`/profile/${f.username}`}
                  className="flex items-center gap-3 p-4 hover:bg-[--surface-2] transition-colors">
                  <Avatar user={f} size={10} />
                  <div>
                    <p className="font-semibold text-sm text-[--text-1]">{f.name}</p>
                    <p className="text-xs text-[--text-3]">@{f.username}</p>
                  </div>
                </a>
              ))
          }
        </div>
      )}
    </div>
  );
}
