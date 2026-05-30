import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen surface-2 flex items-center justify-center p-6">
      <div className="text-center">
        <p className="font-display font-bold text-8xl text-ink-400/20 mb-4">404</p>
        <h1 className="font-display font-bold text-2xl text-[--text-1] mb-2">Page not found</h1>
        <p className="text-[--text-3] mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary mx-auto">Go home</Link>
      </div>
    </div>
  );
}
