import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// ── Thunks ──────────────────────────────────────────────
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try   { return (await api.post('/auth/register', data)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Registration failed'); }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try   { return (await api.post('/auth/login', data)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed'); }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try   { return (await api.get('/auth/me')).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const updateProfileThunk = createAsyncThunk('auth/updateProfile', async (fd, { rejectWithValue }) => {
  try   { return (await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Update failed'); }
});

// ── Slice ───────────────────────────────────────────────
const saved = JSON.parse(localStorage.getItem('sc_user') || 'null');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        saved,
    token:       localStorage.getItem('sc_token') || null,
    loading:     false,
    error:       null,
    hydrated:    false,
  },
  reducers: {
    logout(state) {
      state.user = null; state.token = null;
      localStorage.removeItem('sc_token'); localStorage.removeItem('sc_user');
    },
    clearError(state)       { state.error = null; },
    patchUser(state, { payload }) {
      state.user = { ...state.user, ...payload };
      localStorage.setItem('sc_user', JSON.stringify(state.user));
    },
  },
  extraReducers: b => {
    const persist = (state, { payload }) => {
      state.loading = false;
      state.user    = payload.user;
      state.token   = payload.token;
      localStorage.setItem('sc_token', payload.token);
      localStorage.setItem('sc_user',  JSON.stringify(payload.user));
    };

    b.addCase(registerUser.pending,  s => { s.loading = true;  s.error = null; })
     .addCase(registerUser.fulfilled, persist)
     .addCase(registerUser.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })

     .addCase(loginUser.pending,  s => { s.loading = true;  s.error = null; })
     .addCase(loginUser.fulfilled, persist)
     .addCase(loginUser.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })

     .addCase(fetchMe.fulfilled, (s, { payload }) => {
       s.hydrated = true; s.user = payload.user;
       localStorage.setItem('sc_user', JSON.stringify(payload.user));
     })
     .addCase(fetchMe.rejected, s => {
       s.hydrated = true; s.user = null; s.token = null;
       localStorage.removeItem('sc_token'); localStorage.removeItem('sc_user');
     })

     .addCase(updateProfileThunk.pending,  s => { s.loading = true; })
     .addCase(updateProfileThunk.fulfilled, (s, { payload }) => {
       s.loading = false; s.user = payload.user;
       localStorage.setItem('sc_user', JSON.stringify(payload.user));
     })
     .addCase(updateProfileThunk.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });
  },
});

export const { logout, clearError, patchUser } = authSlice.actions;
export default authSlice.reducer;
