import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from "../assets/logo.png";

export default function Login() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm]   = useState({ email: '', password: '' });
  const [show, setShow]   = useState(false);

  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const submit = async e => {
    e.preventDefault();
    try { await dispatch(loginUser(form)).unwrap(); toast.success('Welcome back!'); navigate('/'); }
    catch {}
  };

  return (
    <>
      <h2 className="font-display font-bold text-2xl text-[--text-1] mb-1">Sign in</h2>
      <p className="text-sm text-[--text-3] mb-7">Enter your credentials to continue</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com" className="field" required autoComplete="email" />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" className="field pr-10" required autoComplete="current-password" />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-2] transition-colors">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[--text-3]">
        No account?{' '}
        <Link to="/register" className="font-semibold text-ink-400 hover:text-ink-500 transition-colors">
          Create one free
        </Link>
      </p>
    </>
  );
}
