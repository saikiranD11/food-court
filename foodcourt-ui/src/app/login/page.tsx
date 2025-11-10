"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { getUserToken } from "@/lib/session";
import { setCurrentToken, setProfile } from "@/lib/auth";
import Link from "next/link";
import { Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [display, setDisplay] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit() {
    setErr(null);
    setSuccess(false);
    setBusy(true);
    
    try {
      const guest = getUserToken();
      const res = mode === "signup"
        ? await api.signup(email, password, display || undefined, guest)
        : await api.login(email, password, guest);

      setCurrentToken(res.user_token);
      setProfile({ email: res.email, display_name: res.display_name });
      setSuccess(true);
      
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Logo & Heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-2xl font-bold text-white shadow-lg">
            F
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {mode === "login" ? "Welcome back!" : "Create account"}
          </h1>
          <p className="text-gray-600">
            {mode === "login" 
              ? "Sign in to continue ordering" 
              : "Join to save your orders and more"}
          </p>
        </div>

        {/* Form Card */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
          <div className="p-8">
            <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-5">
              {/* Name Field (Signup Only) */}
              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={display}
                      onChange={(e) => setDisplay(e.target.value)}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-base transition-colors focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-base transition-colors focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-base transition-colors focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
                  />
                </div>
              </div>

              {/* Error Message */}
              {err && (
                <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4">
                  <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-rose-900">Error</p>
                    <p className="text-rose-700">{err}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900">Success!</p>
                    <p className="text-green-700">Redirecting to home...</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={busy || success}
                className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {busy ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Please wait...
                  </div>
                ) : success ? (
                  "Success! Redirecting..."
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center text-sm text-gray-600">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => { setMode("signup"); setErr(null); }}
                    className="font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => { setMode("login"); setErr(null); }}
                    className="font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            {/* Terms */}
            <p className="mt-6 text-center text-xs text-gray-500">
              By continuing, you agree to our{" "}
              <a href="#" className="text-rose-600 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-rose-600 hover:underline">Privacy Policy</a>
            </p>
          </div>

          {/* Decorative Footer */}
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 px-8 py-4">
            <p className="text-center text-sm text-gray-600">
              🔒 Your data is secure with 256-bit encryption
            </p>
          </div>
        </div>

        {/* Guest Shopping Info */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
          <p>
            💡 <strong>Tip:</strong> You can shop without an account! 
            Register later to save your order history.
          </p>
        </div>
      </div>
    </div>
  );
}