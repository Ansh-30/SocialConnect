import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [show, setShow] = useState(false);

  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const upd = k => e => setForm({ ...form, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password min 6 chars'); return; }
    try {
      await dispatch(registerUser(form)).unwrap();
      toast.success('Welcome to SocialConnect 🎉');
      navigate('/');
    } catch {}
  };

  return (
    <>
      <h2 className="font-display font-bold text-2xl text-[--text-1] mb-1">Create account</h2>
      <p className="text-sm text-[--text-3] mb-7">Join the community today — it's free</p>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Full name</label>
            <input value={form.name} onChange={upd('name')} placeholder="Jane Doe" className="field" required />
          </div>
          <div>
            <label className="label">Username</label>
            <input value={form.username} onChange={upd('username')} placeholder="janedoe"
              className="field" required pattern="[a-zA-Z0-9_]+" title="Letters, numbers, underscores" />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" value={form.email} onChange={upd('email')} placeholder="you@example.com"
            className="field" required />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} value={form.password} onChange={upd('password')}
              placeholder="Min. 6 characters" className="field pr-10" required minLength={6} />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-2] transition-colors">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {loading ? 'Creating…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[--text-3]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-ink-400 hover:text-ink-500 transition-colors">Sign in</Link>
      </p>
    </>
  );
}
