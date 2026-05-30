import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCreatePost } from '../../store/uiSlice';
import { X, Image, Hash, Loader2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CreatePostModal({ onCreated }) {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [caption, setCaption] = useState('');
  const [tags,    setTags]    = useState('');
  const [img,     setImg]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef               = useRef(null);

  const close = () => dispatch(closeCreatePost());

  const pickImage = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Max 5 MB'); return; }
    setImg(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!caption.trim() && !img) { toast.error('Add caption or image'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('caption', caption);
      fd.append('tags', tags);
      if (img) fd.append('image', img);
      const r = await api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Posted!');
      onCreated?.(r.data.post);
      close();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to post');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
         onClick={e => e.target === e.currentTarget && close()}>
      <div className="w-full max-w-lg card shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--border]">
          <h2 className="font-display font-bold text-lg text-[--text-1]">Create Post</h2>
          <button onClick={close} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex gap-3">
            <Avatar user={user} size={11} />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-[--text-1]">{user?.name}</p>
              <p className="text-xs text-[--text-3]">@{user?.username}</p>
            </div>
          </div>

          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            maxLength={2200}
            className="field resize-none"
          />
          <div className="flex justify-between text-xs text-[--text-3]">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              <input value={tags} onChange={e => setTags(e.target.value)}
                placeholder="Tags: react, design, webdev"
                className="bg-transparent border-none outline-none text-sm placeholder:text-[--text-3] w-64" />
            </span>
            <span>{caption.length}/2200</span>
          </div>

          {preview && (
            <div className="relative group">
              <img src={preview} alt="" className="w-full rounded-xl object-cover max-h-72" />
              <button onClick={() => { setImg(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[--border]">
          <button onClick={() => fileRef.current?.click()} className="btn-ghost text-ink-400 font-semibold">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">Photo</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />

          <button onClick={submit} disabled={loading || (!caption.trim() && !img)} className="btn-primary">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Posting…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
