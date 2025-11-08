export function getUserToken(): string {
  const KEY = "fc_user_token";
  if (typeof window !== "undefined") {
    const logged = localStorage.getItem(KEY);
    if (logged) return logged;
    // if no token, create a guest token
    const t = "guest-" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(KEY, t);
    return t;
  }
  // server-side render: return a placeholder (won't be used for mutations)
  return "guest-server";
}
