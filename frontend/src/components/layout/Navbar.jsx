import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  Moon,
  Sun,
  Plus,
  LogOut,
  User,
  Shield,
  Bookmark,
  X,
  Sparkles,
} from 'lucide-react';

import { logout } from '../../store/authSlice';
import { toggleDark, openCreatePost } from '../../store/uiSlice';

import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';
import logo from "../../assets/logo.png";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((s) => s.auth);
  const { dark } = useSelector((s) => s.ui);

  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () =>
      document.removeEventListener('mousedown', handler);
  }, []);

  // Logout
  const handleLogout = () => {
    dispatch(logout());

    toast.success('Logged out successfully');

    navigate('/login');
  };

  // Search
  const handleSearch = (e) => {
    e.preventDefault();

    if (q.trim()) {
      navigate(
        `/search?q=${encodeURIComponent(q.trim())}`
      );

      setQ('');
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[--surface-1]/80 backdrop-blur-xl border-b border-[--border]">
      <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 shrink-0"
        >
          <img
            src={logo}
            alt="SocioConnect Logo"
            className="w-11 h-11 rounded-2xl shadow-xl"
          />

          <div className="hidden sm:block">
            <h1 className="font-bold text-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              SocioConnect
            </h1>

            <p className="text-[10px] text-[--text-3] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-500" />
              Connect • Share • Explore
            </p>
          </div>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-md hidden sm:flex"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-3]" />

            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users, posts, #tags..."
              className="field pl-10 pr-10 w-full text-sm rounded-2xl"
            />

            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-1] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Right Side */}
        <div className="ml-auto flex items-center gap-2">

          {/* Create Post */}
          <button
            onClick={() => dispatch(openCreatePost())}
            className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2 rounded-2xl"
          >
            <Plus className="w-4 h-4" />

            <span className="hidden sm:inline">
              Create Post
            </span>
          </button>

          {/* Dark Mode */}
          <button
            onClick={() => dispatch(toggleDark())}
            className="p-2.5 rounded-2xl hover:bg-[--surface-2] transition-colors text-[--text-2]"
            title="Toggle Dark Mode"
          >
            {dark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* User Menu */}
          <div
            className="relative"
            ref={menuRef}
          >
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1 rounded-2xl hover:bg-[--surface-2] transition-all"
            >
              <Avatar user={user} size={9} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 w-60 bg-[--surface-1] border border-[--border] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">

                {/* User Info */}
                <div className="px-4 py-4 border-b border-[--border]">
                  <p className="font-semibold text-sm text-[--text-1] truncate">
                    {user?.name}
                  </p>

                  <p className="text-xs text-[--text-3] truncate mt-1">
                    @{user?.username}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">

                  {/* Profile */}
                  <Link
                    to={`/profile/${user?.username}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[--text-2] hover:bg-[--surface-2] hover:text-[--text-1] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>

                  {/* Saved */}
                  <Link
                    to="/saved"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[--text-2] hover:bg-[--surface-2] hover:text-[--text-1] transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                    Saved Posts
                  </Link>

                  {/* Admin */}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-amber-500 hover:bg-amber-500/10 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}