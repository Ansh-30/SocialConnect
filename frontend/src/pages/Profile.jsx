import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  updateProfileThunk,
} from '../store/authSlice';

import api from '../utils/api';

import Avatar from '../components/common/Avatar';
import PostCard from '../components/posts/PostCard';

import {
  PageLoader,
} from '../components/common/Loaders';

import {
  Edit3,
  MapPin,
  Link2,
  Grid,
  Users,
  Camera,
  Loader2,
  Check,
  X,
} from 'lucide-react';

import { fmtCount } from '../utils/helpers';

import toast from 'react-hot-toast';

export default function Profile() {

  const { username } = useParams();

  const dispatch = useDispatch();

  const { user: me } = useSelector(
    (state) => state.auth
  );

  const fileRef = useRef(null);


  // ─────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────

  const [profile, setProfile] =
    useState(null);

  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [postsLoad, setPostsLoad] =
    useState(true);

  const [following, setFollowing] =
    useState(false);

  const [tab, setTab] =
    useState('posts');

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [avatarFile, setAvatarFile] =
    useState(null);

  const [avatarPrev, setAvatarPrev] =
    useState(null);

  const [form, setForm] = useState({
    name: '',
    bio: '',
    website: '',
    location: '',
  });


  // ─────────────────────────────────────────────
  // Ownership
  // ─────────────────────────────────────────────

  const isOwn =
    me?.username === username;


  // ─────────────────────────────────────────────
  // Fetch Profile
  // ─────────────────────────────────────────────

  useEffect(() => {

    fetchProfile();

  }, [username]);


  const fetchProfile = async () => {

    setLoading(true);

    try {

      const response =
        await api.get(
          `/users/by-username/${username}`
        );

      const user = response.data.user;

      setProfile(user);

      setFollowing(
        user.followers
          ?.map((f) => f._id || f)
          .includes(me?._id)
      );

      setForm({
        name: user.name || '',
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
      });

      fetchPosts(user._id);

    } catch {

      toast.error('User not found');
    }

    finally {

      setLoading(false);
    }
  };


  // ─────────────────────────────────────────────
  // Fetch Posts
  // ─────────────────────────────────────────────

  const fetchPosts = async (uid) => {

    setPostsLoad(true);

    try {

      const response =
        await api.get(`/users/${uid}/posts`);

      setPosts(response.data.posts);

    } catch {

      toast.error('Failed to load posts');
    }

    finally {

      setPostsLoad(false);
    }
  };


  // ─────────────────────────────────────────────
  // Follow / Unfollow
  // ─────────────────────────────────────────────

  const toggleFollow = async () => {

    try {

      const response =
        await api.post(
          `/users/follow/${profile._id}`
        );

      setFollowing(
        response.data.isFollowing
      );

    } catch {

      toast.error('Failed');
    }
  };


  // ─────────────────────────────────────────────
  // Pick Avatar
  // ─────────────────────────────────────────────

  const pickAvatar = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      toast.error(
        'Image must be under 5 MB'
      );

      return;
    }

    setAvatarFile(file);

    setAvatarPrev(
      URL.createObjectURL(file)
    );
  };


  // ─────────────────────────────────────────────
  // Save Profile
  // ─────────────────────────────────────────────

  const saveProfile = async () => {

    setSaving(true);

    try {

      const formData =
        new FormData();

      formData.append(
        'name',
        form.name
      );

      formData.append(
        'bio',
        form.bio
      );

      formData.append(
        'website',
        form.website
      );

      formData.append(
        'location',
        form.location
      );

      if (avatarFile) {

        formData.append(
          'avatar',
          avatarFile
        );
      }

      await dispatch(
        updateProfileThunk(formData)
      ).unwrap();

      await fetchProfile();

      setEditing(false);

      setAvatarPrev(null);

      setAvatarFile(null);

      toast.success(
        'Profile updated!'
      );

    } catch {

      toast.error(
        'Failed to update profile'
      );
    }

    finally {

      setSaving(false);
    }
  };


  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────

  if (loading) {

    return <PageLoader />;
  }


  // ─────────────────────────────────────────────
  // Not Found
  // ─────────────────────────────────────────────

  if (!profile) {

    return (

      <div className="card p-12 text-center text-[--text-3]">

        User not found

      </div>
    );
  }


  return (

    <div className="space-y-4 animate-fade-up">

      {/* Profile Card */}
      <div className="card p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">

          {/* Avatar */}
          <div className="relative">

            {editing ? (

              <label className="cursor-pointer group relative block">

                <img
                  src={
                    avatarPrev
                      ? avatarPrev
                      : profile?.avatar
                        ? profile.avatar.startsWith(
                            'http'
                          )
                          ? profile.avatar
                          : `https://socialconnect-backend-czfw.onrender.com${profile.avatar}`
                        : 'https://placehold.co/200x200?text=Avatar'
                  }

                  alt="Profile"

                  className="w-20 h-20 rounded-full object-cover ring-2 ring-[--border] shadow-lg"

                  onError={(e) => {

                    console.log(
                      '❌ Avatar failed:',
                      profile?.avatar
                    );

                    e.target.src =
                      'https://placehold.co/200x200?text=Avatar';
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">

                  <Camera className="w-5 h-5 text-white" />

                </div>

                {/* Hidden Input */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={pickAvatar}
                />
              </label>

            ) : (

              <img
                src={
                  profile?.avatar
                    ? profile.avatar.startsWith(
                        'http'
                      )
                      ? profile.avatar
                      : `https://socialconnect-backend-czfw.onrender.com${profile.avatar}`
                    : 'https://placehold.co/200x200?text=Avatar'
                }

                alt="Profile"

                className="w-20 h-20 rounded-full object-cover ring-2 ring-[--border] shadow-lg"

                onError={(e) => {

                  console.log(
                    '❌ Avatar failed:',
                    profile?.avatar
                  );

                  e.target.src =
                    'https://placehold.co/200x200?text=Avatar';
                }}
              />
            )}
          </div>


          {/* Actions */}
          {isOwn ? (

            editing ? (

              <div className="flex gap-2">

                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="btn-primary py-2 px-4"
                >

                  {saving ? (

                    <Loader2 className="w-4 h-4 animate-spin" />

                  ) : (

                    <Check className="w-4 h-4" />
                  )}

                  Save
                </button>

                <button
                  onClick={() => {

                    setEditing(false);

                    setAvatarPrev(null);
                  }}

                  className="btn-outline py-2 px-3"
                >

                  <X className="w-4 h-4" />

                </button>
              </div>

            ) : (

              <button
                onClick={() =>
                  setEditing(true)
                }

                className="btn-outline py-2 px-4"
              >

                <Edit3 className="w-4 h-4" />

                Edit Profile
              </button>
            )

          ) : (

            <button
              onClick={toggleFollow}

              className={
                following
                  ? 'btn-outline'
                  : 'btn-primary'
              }
            >

              {following
                ? 'Following'
                : 'Follow'}
            </button>
          )}
        </div>


        {/* Profile Info */}
        {editing ? (

          <div className="space-y-3">

            <input
              value={form.name}

              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }

              placeholder="Name"

              className="field"
            />

            <textarea
              value={form.bio}

              onChange={(e) =>
                setForm({
                  ...form,
                  bio: e.target.value,
                })
              }

              rows={3}

              maxLength={200}

              placeholder="Bio"

              className="field resize-none"
            />

            <div className="grid grid-cols-2 gap-3">

              <input
                value={form.location}

                onChange={(e) =>
                  setForm({
                    ...form,
                    location:
                      e.target.value,
                  })
                }

                placeholder="Location"

                className="field"
              />

              <input
                value={form.website}

                onChange={(e) =>
                  setForm({
                    ...form,
                    website:
                      e.target.value,
                  })
                }

                placeholder="Website"

                className="field"
              />
            </div>
          </div>

        ) : (

          <>
            <h1 className="font-display font-bold text-xl text-[--text-1] mb-1">

              {profile.name}

            </h1>

            <p className="text-sm text-[--text-3] mb-3">

              @{profile.username}

            </p>

            {profile.bio && (

              <p className="text-sm text-[--text-2] leading-relaxed mb-3">

                {profile.bio}

              </p>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-[--text-3] mb-4">

              {profile.location && (

                <span className="flex items-center gap-1">

                  <MapPin className="w-3.5 h-3.5" />

                  {profile.location}
                </span>
              )}

              {profile.website && (

                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-ink-400 hover:underline"
                >

                  <Link2 className="w-3.5 h-3.5" />

                  {profile.website.replace(
                    /https?:\/\//,
                    ''
                  )}
                </a>
              )}
            </div>
          </>
        )}


        {/* Stats */}
        <div className="flex gap-6 pt-4 border-t border-[--border]">

          {[
            {
              label: 'Posts',
              value: posts.length,
            },

            {
              label: 'Followers',
              value:
                profile.followers
                  ?.length || 0,
            },

            {
              label: 'Following',
              value:
                profile.following
                  ?.length || 0,
            },
          ].map((item) => (

            <div
              key={item.label}
              className="text-center"
            >

              <p className="font-bold text-[--text-1]">

                {fmtCount(item.value)}

              </p>

              <p className="text-xs text-[--text-3]">

                {item.label}

              </p>
            </div>
          ))}
        </div>
      </div>


      {/* Tabs */}
      <div className="card p-1.5 flex gap-1">

        {[
          {
            key: 'posts',
            label: 'Posts',
            icon: Grid,
          },

          {
            key: 'followers',
            label: `Followers (${
              profile.followers
                ?.length || 0
            })`,
            icon: Users,
          },
        ].map(
          ({
            key,
            label,
            icon: Icon,
          }) => (

            <button
              key={key}

              onClick={() =>
                setTab(key)
              }

              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === key
                  ? 'bg-ink-400 text-white'
                  : 'text-[--text-3] hover:bg-[--surface-2]'
              }`}
            >

              <Icon className="w-4 h-4" />

              {label}
            </button>
          )
        )}
      </div>


      {/* Posts */}
      {tab === 'posts' && (

        postsLoad ? (

          <div className="card p-8 text-center text-sm text-[--text-3]">

            Loading...

          </div>

        ) : posts.length === 0 ? (

          <div className="card p-12 text-center">

            <Grid className="w-10 h-10 text-[--text-3] mx-auto mb-3" />

            <p className="text-sm text-[--text-3]">

              No posts yet

            </p>
          </div>

        ) : (

          <div className="space-y-4">

            {posts.map((post) => (

              <PostCard
                key={post._id}
                post={post}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}