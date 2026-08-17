"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { X, Loader2, Mail, Lock, User, Sparkles, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultTab?: "signin" | "signup";
  triggerMessage?: string; // e.g. "Sign in to save this trip"
}

export default function AuthModal({
  onClose,
  onSuccess,
  defaultTab = "signin",
  triggerMessage,
}: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const reset = () => {
    setError(null);
    setSuccessMsg(null);
  };

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setSuccessMsg("Signed in!");
        setTimeout(onSuccess, 500);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    reset();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      // Auto sign in after registration
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Account created! Please sign in manually.");
        setTab("signin");
      } else {
        setSuccessMsg("Account created and signed in!");
        setTimeout(onSuccess, 600);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(45,42,74,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(108,92,231,0.22)" }}
      >
        {/* Header gradient strip */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#6C5CE7,#00B894)" }} />

        {/* Close */}
        <button
          id="auth-modal-close"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--color-muted)] hover:bg-[var(--color-bg)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8">
          {/* Icon + heading */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
              style={{ background: "linear-gradient(135deg,#6C5CE7,#00B894)" }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-heading text-2xl text-[var(--color-text)] text-center">
              {tab === "signin" ? "Welcome back" : "Create account"}
            </h2>
            {triggerMessage && (
              <p className="text-sm text-[var(--color-muted)] mt-1 text-center">{triggerMessage}</p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex rounded-2xl bg-[var(--color-bg)] p-1 mb-6 gap-1">
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                id={`auth-tab-${t}`}
                onClick={() => { setTab(t); reset(); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? "bg-white text-[var(--color-coral)] shadow-sm"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={tab === "signin" ? handleSignIn : handleSignUp} className="flex flex-col gap-4">
            {tab === "signup" && (
              <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
                Name (optional)
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input-base pl-9"
                  />
                </div>
              </label>
            )}

            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
              Email
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-base pl-9"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
              Password
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === "signup" ? "Min 8 characters" : "Your password"}
                  className="input-base pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-2xl p-3 text-sm" style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}>
                ⚠️ {error}
              </div>
            )}
            {successMsg && (
              <div className="rounded-2xl p-3 text-sm" style={{ background: "var(--color-teal-light)", color: "var(--color-teal-dark)" }}>
                ✓ {successMsg}
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white btn-3d-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {tab === "signin" ? "Signing in…" : "Creating account…"}</>
              ) : (
                tab === "signin" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-[var(--color-muted)]">
            {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setTab(tab === "signin" ? "signup" : "signin"); reset(); }}
              className="text-[var(--color-coral)] font-semibold hover:underline"
            >
              {tab === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
