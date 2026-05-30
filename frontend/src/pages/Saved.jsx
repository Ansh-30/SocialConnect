import { useEffect, useState } from 'react';
import api from '../utils/api';
import PostCard from '../components/posts/PostCard';
import { PageLoader } from '../components/common/Loaders';
import { Bookmark } from 'lucide-react';

export default function Saved() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/saved-posts')
      .then(r => setPosts(r.data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center gap-3 px-1">
        <Bookmark className="w-5 h-5 text-ink-400 fill-current" />
        <h1 className="font-display font-bold text-xl text-[--text-1]">Saved Posts</h1>
        <span className="ml-auto text-sm text-[--text-3]">{posts.length} saved</span>
      </div>

      {posts.length === 0 ? (
        <div className="card p-14 text-center">
          <Bookmark className="w-12 h-12 text-[--text-3] mx-auto mb-4" />
          <p className="font-display font-bold text-[--text-1] mb-2">No saved posts yet</p>
          <p className="text-sm text-[--text-3]">Tap the bookmark icon on any post to save it here</p>
        </div>
      ) : (
        posts.map(p => (
          <PostCard
            key={p._id}
            post={p}
            onRemove={id => setPosts(prev => prev.filter(x => x._id !== id))}
          />
        ))
      )}
    </div>
  );
}
