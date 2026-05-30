import { initials, avatarGrad } from '../../utils/helpers';

export default function Avatar({ user, size = 10, ring = true, className = '' }) {
  const px = size * 4;
  const sz = `${px}px`;
  const fs = `${Math.max(10, px * 0.38)}px`;
  const grad = avatarGrad(user?.username || user?.name || '');

  if (user?.avatar) {
    return (
      <img
        src={`https://socialconnect-backend-czfw.onrender.com${post.image}`}
        alt={user?.name || "User"}
        style={{ width: sz, height: sz, minWidth: sz, fontSize: fs }}
        className={`rounded-full object-cover ${
          ring ? 'ring-2 ring-white dark:ring-[#13141f]' : ''
        } ${className}`}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      style={{ width: sz, height: sz, minWidth: sz, fontSize: fs }}
      className={`rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${grad} ${
        ring ? 'ring-2 ring-white dark:ring-[#13141f]' : ''
      } ${className}`}
    >
      {initials(user?.name || user?.username)}
    </div>
  );
}