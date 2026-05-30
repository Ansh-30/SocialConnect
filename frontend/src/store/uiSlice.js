import { createSlice } from '@reduxjs/toolkit';

const dark = localStorage.getItem('sc_dark') === 'true';
if (dark) document.documentElement.classList.add('dark');

const uiSlice = createSlice({
  name: 'ui',
  initialState: { dark, createPost: false },
  reducers: {
    toggleDark(state) {
      state.dark = !state.dark;
      document.documentElement.classList.toggle('dark', state.dark);
      localStorage.setItem('sc_dark', state.dark);
    },
    openCreatePost(state)  { state.createPost = true;  },
    closeCreatePost(state) { state.createPost = false; },
  },
});

export const { toggleDark, openCreatePost, closeCreatePost } = uiSlice.actions;
export default uiSlice.reducer;
