"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { CursorGlow } from "@/components/motion";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  MapPin,
  Compass,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Extract and sanitize callbackUrl
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallback && rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/discover";

  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect directly to callbackUrl
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const resetMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const isDiscoverTarget = callbackUrl.includes("discover");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please verify your credentials and try again.");
        setLoading(false);
      } else {
        setSuccessMsg("Signed in successfully! Redirecting you now…");
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 350);
      }
    } catch {
      setError("Network or server error during sign in. Please try again.");
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          name: name.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try a different email.");
        setLoading(false);
        return;
      }

      // Automatically sign in with credentials upon registration
      const loginResult = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        setSuccessMsg("Account created! Please sign in with your password.");
        setTab("signin");
        setLoading(false);
      } else {
        setSuccessMsg("Account created and signed in! Redirecting you now…");
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 450);
      }
    } catch {
      setError("An unexpected error occurred during account creation. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <CursorGlow />
      <Navbar />

      <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center relative overflow-hidden bg-[var(--color-bg)]">
        {/* Subtle background ambient mesh */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl bg-indigo-500" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl bg-teal-400" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl bg-coral-500" />
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Card Container */}
          <div
            className="relative bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 overflow-hidden shadow-2xl transition-all"
            style={{ boxShadow: "0 20px 60px rgba(108, 92, 231, 0.12)" }}
          >
            {/* Header Gradient Strip */}
            <div
              className="absolute top-0 inset-x-0 h-1.5"
              style={{ background: "linear-gradient(90deg, #6C5CE7, #00B894, #FF5E36)" }}
            />

            {/* Context Badge & Heading */}
            <div className="text-center mb-6 pt-2">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 text-[var(--color-coral)] bg-[var(--color-coral-light)]"
              >
                {isDiscoverTarget ? (
                  <>
                    <Compass className="w-3.5 h-3.5" />
                    3-Step Journey Blueprint
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Welcome Traveler
                  </>
                )}
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight">
                {tab === "signin" ? "Sign in to continue" : "Create your account"}
              </h1>

              <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-2 leading-relaxed">
                {isDiscoverTarget
                  ? "Sign in to explore curated destinations, personalized AI recommendations, and step-by-step blueprints."
                  : "Access ML cost predictions, curated itineraries, and saved journeys across devices."}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex rounded-2xl bg-[var(--color-bg)] p-1.5 mb-6 gap-1 border border-[var(--color-border)]">
              <button
                type="button"
                id="tab-signin-btn"
                onClick={() => {
                  setTab("signin");
                  resetMessages();
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  tab === "signin"
                    ? "bg-white text-[var(--color-coral)] shadow-sm font-bold"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-signup-btn"
                onClick={() => {
                  setTab("signup");
                  resetMessages();
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  tab === "signup"
                    ? "bg-white text-[var(--color-coral)] shadow-sm font-bold"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={tab === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
              {tab === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Your Name (optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                    <input
                      id="signin-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Traveler"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <input
                    id="signin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[var(--color-text)]">
                    Password
                  </label>
                  {tab === "signup" && (
                    <span className="text-[10px] text-[var(--color-muted)]">
                      Minimum 8 characters
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === "signup" ? "Create a strong password" : "Enter your password"}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Feedback Notifications */}
              {error && (
                <div
                  id="signin-error-msg"
                  className="rounded-xl p-3 text-xs sm:text-sm font-medium border border-red-200 bg-[var(--color-danger-light)] text-[var(--color-danger)] animate-fade-in flex items-start gap-2"
                >
                  <span className="flex-shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div
                  id="signin-success-msg"
                  className="rounded-xl p-3 text-xs sm:text-sm font-medium border border-teal-200 bg-[var(--color-teal-light)] text-[var(--color-teal-dark)] animate-fade-in flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--color-teal)]" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="signin-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white btn-3d-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-coral transition-transform active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{tab === "signin" ? "Signing In…" : "Creating Account…"}</span>
                  </>
                ) : (
                  <>
                    <span>{tab === "signin" ? "Sign In & Continue" : "Create Account & Continue"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Switch Link */}
            <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-muted)]">
              {tab === "signin" ? (
                <>
                  New to Journey Curator?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("signup");
                      resetMessages();
                    }}
                    className="font-bold text-[var(--color-coral)] hover:underline ml-1"
                  >
                    Create a free account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("signin");
                      resetMessages();
                    }}
                    className="font-bold text-[var(--color-coral)] hover:underline ml-1"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Trust Footnote */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-muted)]">
            <ShieldCheck className="w-4 h-4 text-[var(--color-teal)]" />
            <span>Secure authentication &bull; Passwords hashed with bcrypt</span>
          </div>

          <div className="mt-3 text-center">
            <Link
              href="/"
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] underline transition-colors"
            >
              &larr; Back to Journey Curator Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function SignInSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center bg-[var(--color-bg)]">
      <div className="w-full max-w-md h-[460px] rounded-3xl bg-white/70 animate-pulse border border-[var(--color-border)]" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignInContent />
    </Suspense>
  );
}
