import { create } from "zustand";
import { BRAND } from "../config/brand";
import { fetchGitHubUser } from "../lib/github";
import type { LoginInput, MembershipPlan, RegisterInput, User } from "../types";
import { hashPassword, loadJson, saveJson } from "./storage";

interface StoredUser extends User {
  passwordHash?: string;
}

function toPublicUser(u: StoredUser): User {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

function defaultUserFields(
  partial: Partial<User> &
    Pick<User, "id" | "username" | "email" | "displayName" | "createdAt">,
): Omit<StoredUser, "passwordHash"> {
  return {
    bio: "",
    membershipPlan: "free",
    githubConnected: false,
    authProvider: "email",
    ...partial,
  };
}

interface AuthState {
  currentUser: User | null;
  users: StoredUser[];
  register: (input: RegisterInput) => { ok: true } | { ok: false; error: string };
  login: (input: LoginInput) => { ok: true } | { ok: false; error: string };
  loginWithGitHub: (
    githubUsername: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  connectGitHub: (
    githubUsername: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  disconnectGitHub: () => void;
  setMembershipPlan: (plan: MembershipPlan) => void;
  logout: () => void;
  hydrate: () => void;
}

function persistUsers(users: StoredUser[], sessionId: string | null, current: User | null) {
  saveJson("users", users);
  saveJson("session", sessionId);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  users: [],

  hydrate: () => {
    const raw = loadJson<StoredUser[]>("users", []);
    const users = raw.map((u) => ({
      ...u,
      membershipPlan: u.membershipPlan ?? "free",
      githubConnected: u.githubConnected ?? Boolean(u.githubUsername),
      authProvider: u.authProvider ?? "email",
    }));
    const sessionId = loadJson<string | null>("session", null);
    const found = sessionId ? users.find((u) => u.id === sessionId) : null;
    set({ users, currentUser: found ? toPublicUser(found) : null });
  },

  register: (input) => {
    const users = get().users.length ? get().users : loadJson<StoredUser[]>("users", []);
    if (users.some((u) => u.username.toLowerCase() === input.username.toLowerCase())) {
      return { ok: false, error: "Username already taken." };
    }
    if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return { ok: false, error: "Email already registered." };
    }
    if (input.password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }

    const newUser: StoredUser = {
      ...defaultUserFields({
        id: `usr_${crypto.randomUUID().slice(0, 8)}`,
        username: input.username,
        email: input.email,
        displayName: input.displayName || input.username,
        createdAt: new Date().toISOString(),
        membershipPlan: input.membershipPlan,
        authProvider: "email",
      }),
      passwordHash: hashPassword(input.password),
    };
    const next = [...users, newUser];
    persistUsers(next, newUser.id, toPublicUser(newUser));
    set({ users: next, currentUser: toPublicUser(newUser) });
    return { ok: true };
  },

  login: (input) => {
    const users = get().users.length ? get().users : loadJson<StoredUser[]>("users", []);
    const found = users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (!found?.passwordHash || found.passwordHash !== hashPassword(input.password)) {
      return { ok: false, error: "Invalid email or password." };
    }
    persistUsers(users, found.id, toPublicUser(found));
    set({ users, currentUser: toPublicUser(found) });
    return { ok: true };
  },

  loginWithGitHub: async (githubUsername) => {
    const clean = githubUsername.trim().toLowerCase();
    if (!clean) return { ok: false, error: "Enter your GitHub username." };

    let profile;
    try {
      profile = await fetchGitHubUser(clean);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "GitHub error." };
    }

    const users = get().users.length ? get().users : loadJson<StoredUser[]>("users", []);
    let found = users.find(
      (u) => u.githubUsername?.toLowerCase() === profile.login.toLowerCase(),
    );

    if (!found) {
      const baseUsername = profile.login.toLowerCase();
      let username = baseUsername;
      let n = 1;
      while (users.some((u) => u.username.toLowerCase() === username)) {
        username = `${baseUsername}${n++}`;
      }
      found = {
        ...defaultUserFields({
          id: `usr_${crypto.randomUUID().slice(0, 8)}`,
          username,
          email: `${profile.login.toLowerCase()}+github@${BRAND.githubEmailDomain}`,
          displayName: profile.name || profile.login,
          bio: profile.bio || "",
          avatarUrl: profile.avatar_url,
          createdAt: new Date().toISOString(),
          membershipPlan: "free",
          githubUsername: profile.login,
          githubConnected: true,
          authProvider: "github",
        }),
      };
      users.push(found);
    } else {
      found = {
        ...found,
        githubConnected: true,
        githubUsername: profile.login,
        avatarUrl: profile.avatar_url,
        displayName: found.displayName || profile.name || profile.login,
      };
      const idx = users.findIndex((u) => u.id === found!.id);
      users[idx] = found;
    }

    persistUsers(users, found.id, toPublicUser(found));
    set({ users, currentUser: toPublicUser(found) });
    return { ok: true };
  },

  connectGitHub: async (githubUsername) => {
    const user = get().currentUser;
    if (!user) return { ok: false, error: "Log in first." };

    let profile;
    try {
      profile = await fetchGitHubUser(githubUsername.trim());
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "GitHub error." };
    }

    const users = get().users.map((u) =>
      u.id === user.id
        ? {
            ...u,
            githubUsername: profile.login,
            githubConnected: true,
            avatarUrl: profile.avatar_url,
            bio: u.bio || profile.bio || "",
          }
        : u,
    );
    const updated = users.find((u) => u.id === user.id)!;
    persistUsers(users, updated.id, toPublicUser(updated));
    set({ users, currentUser: toPublicUser(updated) });
    return { ok: true };
  },

  disconnectGitHub: () => {
    const user = get().currentUser;
    if (!user) return;
    const users = get().users.map((u) =>
      u.id === user.id ? { ...u, githubConnected: false, githubUsername: undefined } : u,
    );
    const updated = users.find((u) => u.id === user.id)!;
    persistUsers(users, updated.id, toPublicUser(updated));
    set({ users, currentUser: toPublicUser(updated) });
  },

  setMembershipPlan: (plan) => {
    const user = get().currentUser;
    if (!user) return;
    const users = get().users.map((u) =>
      u.id === user.id ? { ...u, membershipPlan: plan } : u,
    );
    const updated = users.find((u) => u.id === user.id)!;
    persistUsers(users, updated.id, toPublicUser(updated));
    set({ users, currentUser: toPublicUser(updated) });
  },

  logout: () => {
    saveJson("session", null);
    set({ currentUser: null });
  },
}));
