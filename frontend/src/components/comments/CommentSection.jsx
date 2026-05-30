import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Send, Trash2, Edit3, Reply, ChevronDown } from 'lucide-react';
import Avatar from '../common/Avatar';
import { timeAgo } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function Reply_({ reply }) {
  return (
    <div className="flex gap-2.5">
      <Avatar user={reply.user} size={7} />
      <div className="bg-[--surface-2] rounded-xl px-3 py-2 flex-1">
        <p className="font-semibold text-xs text-[--text-1] mb-0.5">{reply.user?.name}</p>
        <p className="text-xs text-[--text-2]">{reply.text}</p>
      </div>
    </div>
  );
}

function CommentItem({ comment, onDelete, onEdit, postId }) {
  const { user }       = useSelector(s => s.auth);
  const [replies, setReplies] = useState(comment.replies || []);
  const [showR,   setShowR]   = useState(false);
  const [replyTx, setReplyTx] = useState('');
  const [editTx,  setEditTx]  = useState(comment.text);
  const [editing, setEditing] = useState(false);
  const isOwner = comment.user?._id === user?._id;

  const submitReply = async () => {
    if (!replyTx.trim()) return;
    try {
      const r = await api.post(`/posts/comment/${comment._id}/reply`, { text: replyTx });
      setReplies(r.data.comment.replies || []);
      setReplyTx(''); setShowR(true);
    } catch { toast.error('Failed'); }
  };

  const saveEdit = async () => {
    try { await api.put(`/posts/comment/${comment._id}`, { text: editTx }); onEdit(comment._id, editTx); setEditing(false); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="flex gap-3">
      <Avatar user={comment.user} size={9} className="shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="bg-[--surface-2] rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm text-[--text-1]">{comment.user?.name}</span>
            <span className="text-xs text-[--text-3]">{timeAgo(comment.createdAt)}</span>
          </div>
          {editing ? (
            <div className="flex gap-2 mt-1">
              <input value={editTx} onChange={e => setEditTx(e.target.value)}
                className="field flex-1 py-1.5 text-sm" onKeyDown={e => e.key === 'Enter' && saveEdit()} />
              <button onClick={saveEdit} className="btn-sm btn-primary">Save</button>
              <button onClick={() => setEditing(false)} className="btn-sm btn-outline">✕</button>
            </div>
          ) : (
            <p className="text-sm text-[--text-2]">{comment.text}</p>
          )}
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-3 px-2 mt-1">
          <button onClick={() => setShowR(!showR)} className="text-xs text-[--text-3] hover:text-ink-400 flex items-center gap-1 transition-colors">
            <Reply className="w-3.5 h-3.5" /> Reply
          </button>
          {replies.length > 0 && (
            <button onClick={() => setShowR(!showR)} className="text-xs text-ink-400 flex items-center gap-1">
              <ChevronDown className={`w-3 h-3 transition-transform ${showR ? 'rotate-180' : ''}`} />
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
          {isOwner && !editing && (
            <>
              <button onClick={() => setEditing(true)} className="text-xs text-[--text-3] hover:text-[--text-2]"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => onDelete(comment._id)} className="text-xs text-red-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
            </>
          )}
        </div>

        {showR && (
          <div className="mt-2 space-y-2 pl-3 border-l-2 border-[--border]">
            {replies.map((r, i) => <Reply_ key={i} reply={r} />)}
            <div className="flex gap-2 pt-1">
              <input value={replyTx} onChange={e => setReplyTx(e.target.value)}
                placeholder="Write a reply…" className="field flex-1 text-xs py-2"
                onKeyDown={e => e.key === 'Enter' && submitReply()} />
              <button onClick={submitReply} className="btn-ghost p-2 text-ink-400"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postId, initialComments = [] }) {
  const { user }          = useSelector(s => s.auth);
  const [comments, setCom] = useState(initialComments);
  const [text, setText]    = useState('');
  const [loading, setLoad] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setLoad(true);
    try {
      const r = await api.post(`/posts/comment/${postId}`, { text });
      setCom([r.data.comment, ...comments]);
      setText('');
    } catch { toast.error('Failed to comment'); }
    finally { setLoad(false); }
  };

  const del = async id => {
    if (!confirm('Delete comment?')) return;
    try { await api.delete(`/posts/comment/${id}`); setCom(prev => prev.filter(c => c._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const edit = (id, newText) => setCom(prev => prev.map(c => c._id === id ? { ...c, text: newText } : c));

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <Avatar user={user} size={9} />
        <div className="flex-1 flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment…"
            className="field flex-1" onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()} />
          <button onClick={submit} disabled={!text.trim() || loading} className="btn-primary px-3 py-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {comments.length === 0 && (
        <p className="text-center text-sm text-[--text-3] py-6">No comments yet — be the first!</p>
      )}
      <div className="space-y-4">
        {comments.map(c => <CommentItem key={c._id} comment={c} onDelete={del} onEdit={edit} postId={postId} />)}
      </div>
    </div>
  );
}
