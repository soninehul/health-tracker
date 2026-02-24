import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'health-tracker-theme';

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: getInitialTheme(),
  },
  reducers: {
    setTheme(state, action) {
      const value = action.payload;
      if (value === 'light' || value === 'dark') {
        state.theme = value;
      }
    },
  },
});

export const { setTheme } = themeSlice.actions;
export { STORAGE_KEY };
export default themeSlice.reducer;
