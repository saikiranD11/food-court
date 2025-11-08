"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { getUserToken } from "@/lib/session";
import { setCurrentToken, setProfile } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [display, setDisplay] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      const guest = getUserToken(); // may be guest-xxxx
      const res = mode === "signup"
        ? await api.signup(email, password, display || undefined, guest)
        : await api.login(email, password, guest);

      // Store new user_token (replaces guest)
      setCurrentToken(res.user_token);
      setProfile({ email: res.email, display_name: res.display_name });
      window.location.href = "/"; // back to home
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-semibold">{mode === "login" ? "Log in" : "Create account"}</h1>
      <p className="mb-6 text-sm text-gray-600">
        {mode === "login" ? "Welcome back! " : "Join to save your orders. "}
        <button className="underline" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Create an account" : "Have an account? Log in"}
        </button>
      </p>

      <div className="space-y-4 rounded-2xl border p-5">
        {mode === "signup" && (
          <div>
            <label className="mb-1 block text-sm">Name</label>
            <input className="w-full rounded-lg border px-3 py-2" value={display} onChange={(e) => setDisplay(e.target.value)} />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input className="w-full rounded-lg border px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input className="w-full rounded-lg border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {err && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}

        <button
          disabled={busy}
          onClick={submit}
          className="w-full rounded-full bg-black px-4 py-3 text-white hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Please wait..." : (mode === "login" ? "Log in" : "Sign up")}
        </button>

        <div className="text-center text-sm text-gray-500">
          By continuing, you agree to our Terms & Privacy.
        </div>
      </div>

      <div className="mt-6 text-center text-sm">
        <Link href="/" className="text-blue-600 underline">Back to Home</Link>
      </div>
    </div>
  );
}
