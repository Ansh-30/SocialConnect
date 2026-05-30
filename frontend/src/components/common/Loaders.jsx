export function Spinner({ size = 6, className = '' }) {
  const s = `w-${size} h-${size}`;
  return <div className={`${s} ${className} border-2 border-[--border] border-t-ink-400 rounded-full animate-spin`} />;
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Spinner size={10} />
      <p className="text-sm text-[--text-3]">Loading…</p>
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="card p-5 space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="skel w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skel h-3 w-28 rounded" />
          <div className="skel h-2.5 w-20 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skel h-3 w-full rounded" />
        <div className="skel h-3 w-5/6 rounded" />
        <div className="skel h-3 w-4/6 rounded" />
      </div>
      <div className="skel h-48 w-full rounded-xl" />
      <div className="flex gap-4 pt-1">
        <div className="skel h-8 w-16 rounded-lg" />
        <div className="skel h-8 w-16 rounded-lg" />
        <div className="skel h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}
