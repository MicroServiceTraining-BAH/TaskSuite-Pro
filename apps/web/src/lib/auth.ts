"use client";

export interface User {
  id: string;
  email: string;
  name?: string;
  companyId: string;
  companyName?: string;
  role: string;
}

export interface Client {
  id: string;
  email?: string;
  name: string;
  companyId: string;
}

export interface AuthState {
  user: User | Client | null;
  token: string | null;
  isClient: boolean;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const IS_CLIENT_KEY = "auth_is_client";

export const auth = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  getUser: (): User | Client | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser: (user: User | Client | null): void => {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  isClient: (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(IS_CLIENT_KEY) === "true";
  },

  setIsClient: (isClient: boolean): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(IS_CLIENT_KEY, String(isClient));
  },

  login: (token: string, user: User | Client, isClient: boolean = false): void => {
    auth.setToken(token);
    auth.setUser(user);
    auth.setIsClient(isClient);
  },

  logout: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(IS_CLIENT_KEY);
  },

  isAuthenticated: (): boolean => {
    return auth.getToken() !== null;
  },
};

