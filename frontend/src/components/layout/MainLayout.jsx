import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import CreatePostModal from '../posts/CreatePostModal';

export default function MainLayout() {
  const { createPost } = useSelector(s => s.ui);

  return (
    <div className="min-h-screen surface-2">
      <Navbar />

      <div className="max-w-[1280px] mx-auto px-4 pt-20 pb-16 flex gap-6">
        {/* Left sidebar — hidden on mobile */}
        <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0">
          <div className="sticky top-24"><Sidebar /></div>
        </aside>

        {/* Feed */}
        <main className="flex-1 min-w-0 max-w-[640px] mx-auto lg:mx-0">
          <Outlet />
        </main>

        {/* Right panel — hidden below xl */}
        <aside className="hidden xl:block w-72 flex-shrink-0">
          <div className="sticky top-24"><RightPanel /></div>
        </aside>
      </div>

      {createPost && <CreatePostModal />}
    </div>
  );
}
