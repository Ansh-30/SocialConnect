import { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch } from 'react-redux';

import { openCreatePost } from '../store/uiSlice';

import PostCard from '../components/posts/PostCard';
import { PostSkeleton } from '../components/common/Loaders';

import {
  Flame,
  Clock,
  Users,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import api from '../utils/api';
import logo from '../assets/logo.png';

const TABS = [
  {
    key: 'latest',
    label: 'Latest',
    icon: Clock,
  },
  {
    key: 'trending',
    label: 'Trending',
    icon: Flame,
  },
  {
    key: 'following',
    label: 'Following',
    icon: Users,
  },
];

export default function Home() {
  const dispatch = useDispatch();

  const [feed, setFeed] = useState('latest');
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load posts
  const loadPosts = useCallback(
    async (p = 1, f = feed, reset = false) => {
      setLoading(p === 1);

      try {
        const response = await api.get(
          `/posts?page=${p}&limit=10&feed=${f}`
        );

        const incomingPosts = response.data.posts;

        setPosts((prev) =>
          reset
            ? incomingPosts
            : [...prev, ...incomingPosts]
        );

        setHasMore(
          response.data.pagination.hasMore
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [feed]
  );

  // Reload feed
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);

    loadPosts(1, feed, true);
  }, [feed]);

  // Load more posts
  const loadMore = () => {
    const nextPage = page + 1;

    setPage(nextPage);

    loadPosts(nextPage, feed);
  };

  // Remove post
  const removePost = (id) => {
    setPosts((prev) =>
      prev.filter((post) => post._id !== id)
    );
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-8 mb-6 text-white shadow-2xl">

        <div className="absolute top-0 right-0 opacity-10">
          <TrendingUp className="w-40 h-40" />
        </div>

        <div className="relative z-10 flex items-center gap-5">

          {/* Logo */}
          <img
            src={logo}
            alt="SocioConnect"
            className="w-20 h-20 rounded-3xl shadow-2xl border border-white/20"
          />

          {/* Text */}
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome to SocioConnect
            </h1>

            <p className="text-white/90 text-sm max-w-lg">
              Connect with people, explore trending
              conversations, and share your moments
              with the community.
            </p>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={() => dispatch(openCreatePost())}
          className="mt-6 bg-white text-black px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* Feed Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-[--text-1] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500" />
            Discover Feed
          </h2>

          <p className="text-sm text-[--text-3] mt-1">
            Stay updated with the latest community
            posts
          </p>
        </div>
      </div>

      {/* Feed Tabs */}
      <div className="card p-1.5 flex gap-1 mb-6 rounded-2xl">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFeed(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              feed === key
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg'
                : 'text-[--text-3] hover:text-[--text-1] hover:bg-[--surface-2]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <PostSkeleton key={item} />
          ))}
        </div>
      )}

      {/* Posts */}
      {!loading && (
        <InfiniteScroll
          dataLength={posts.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<PostSkeleton />}
          className="space-y-5"
          endMessage={
            posts.length > 0 ? (
              <p className="text-center text-sm text-[--text-3] py-10">
                You're all caught up ✨
              </p>
            ) : null
          }
        >
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onRemove={removePost}
            />
          ))}
        </InfiniteScroll>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="card p-14 text-center rounded-3xl">

          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-2xl">
            <Plus className="w-12 h-12 text-white" />
          </div>

          <h3 className="font-bold text-3xl text-[--text-1] mb-3">
            No Posts Yet
          </h3>

          <p className="text-sm text-[--text-3] mb-6 max-w-sm mx-auto">
            {feed === 'following'
              ? 'Follow people to see their latest posts and updates.'
              : 'Be the first person to post something amazing on SocioConnect.'}
          </p>

          <button
            onClick={() =>
              dispatch(openCreatePost())
            }
            className="btn-primary mx-auto flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Post
          </button>
        </div>
      )}
    </div>
  );
}