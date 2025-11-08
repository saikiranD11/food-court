const TOKEN_KEY = "fc_user_token";
const PROFILE_KEY = "fc_user_profile";

export function getCurrentToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setCurrentToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}

export function getProfile(): { email: string; display_name?: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setProfile(p: { email: string; display_name?: string }) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
  // regenerate a guest token lazily when needed by getUserToken()
}
