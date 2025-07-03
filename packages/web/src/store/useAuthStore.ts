import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

const TOKEN_KEY = 'typeamp_token';

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,

  login: (user: User, token: string) => {
    // Save token to localStorage
    localStorage.setItem(TOKEN_KEY, token);

    // Update store state
    set({ user, token });
  },

  logout: () => {
    // Remove token from localStorage
    localStorage.removeItem(TOKEN_KEY);

    // Clear store state
    set({ user: null, token: null });
  },

  initializeAuth: () => {
    // Check for existing token in localStorage on app startup
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      // Note: In a real app, you might want to validate the token
      // or fetch user data from the server here
      set({ token });
    }
  },
}));
