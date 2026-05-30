import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchMe } from './store/authSlice';

import MainLayout   from './components/layout/MainLayout';
import AuthLayout   from './components/layout/AuthLayout';
import Home         from './pages/Home';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Profile      from './pages/Profile';
import PostDetail   from './pages/PostDetail';
import Search       from './pages/Search';
import Saved        from './pages/Saved';
import Admin        from './pages/Admin';
import NotFound     from './pages/NotFound';

const Require = ({ children }) => {
  const { token } = useSelector(s => s.auth);
  return token ? children : <Navigate to="/login" replace />;
};
const RequireAdmin = ({ children }) => {
  const { token, user } = useSelector(s => s.auth);
  if (!token)                return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};
const Guest = ({ children }) => {
  const { token } = useSelector(s => s.auth);
  return token ? <Navigate to="/" replace /> : children;
};

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth);

  useEffect(() => { if (token) dispatch(fetchMe()); }, [token]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: '"DM Sans", sans-serif', fontSize: '14px', borderRadius: '12px', fontWeight: 500 },
        }}
      />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login"    element={<Guest><Login /></Guest>} />
          <Route path="/register" element={<Guest><Register /></Guest>} />
        </Route>

        <Route element={<Require><MainLayout /></Require>}>
          <Route path="/"                    element={<Home />} />
          <Route path="/profile/:username"   element={<Profile />} />
          <Route path="/post/:id"            element={<PostDetail />} />
          <Route path="/search"              element={<Search />} />
          <Route path="/saved"               element={<Saved />} />
        </Route>

        <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
        <Route path="*"      element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
