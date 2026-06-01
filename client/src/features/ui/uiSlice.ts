import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const THEME_KEY = 'smartpm_theme';
type Theme = 'light' | 'dark';

interface UiState {
  theme: Theme;
  sidebarOpen: boolean;
}

const initialTheme: Theme =
  (localStorage.getItem(THEME_KEY) as Theme | null) ??
  (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

if (initialTheme === 'dark') document.documentElement.classList.add('dark');

const uiSlice = createSlice({
  name: 'ui',
  initialState: { theme: initialTheme, sidebarOpen: true } as UiState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      localStorage.setItem(THEME_KEY, state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
