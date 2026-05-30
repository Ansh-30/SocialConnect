import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Home, Search, Bookmark, UserCircle2, Plus, Shield } from 'lucide-react';
import { openCreatePost } from '../../store/uiSlice';
import Avatar from '../common/Avatar';
import { fmtCount } from '../../utils/helpers';

const LINKS = [
  { to: '/',       label: 'Home',    icon: Home,         end: true },
  { to: '/search', label: 'Explore', icon: Search },
  { to: '/saved',  label: 'Saved',   icon: Bookmark },
];

export default function Sidebar() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {/* Mini profile */}
      <div
        className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate(`/profile/${user?.username}`)}
      >
        <div className="flex items-center gap-3 mb-3">
          <Avatar user={user} size={11} />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-[--text-1] truncate">{user?.name}</p>
            <p className="text-xs text-[--text-3] truncate">@{user?.username}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[--border] text-center">
          {[
            { label: 'Posts',      val: 0 },
            { label: 'Following',  val: user?.following?.length  || 0 },
            { label: 'Followers',  val: user?.followers?.length  || 0 },
          ].map(({ label, val }) => (
            <div key={label}>
              <p className="font-bold text-sm text-[--text-1]">{fmtCount(val)}</p>
              <p className="text-[10px] text-[--text-3]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="card p-2 space-y-0.5">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
        <NavLink to={`/profile/${user?.username}`}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <UserCircle2 className="w-5 h-5" />
          Profile
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} !text-amber-500 hover:!bg-amber-500/10`}>
            <Shield className="w-5 h-5" />
            Admin
          </NavLink>
        )}
      </nav>

      {/* Post CTA */}
      <button onClick={() => dispatch(openCreatePost())} className="btn-primary w-full justify-center py-3">
        <Plus className="w-5 h-5" />
        Create Post
      </button>
    </div>
  );
}
