"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user, loading: authLoading, refreshAuth } = useAuth();

    useEffect(() => {
        // Redirect if user is already logged in
        if (!authLoading && user) {
            router.replace("/tasks");
        }
    }, [user, authLoading, router]);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            toast.warn("All fields are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/auth/register", { name, email, password });

            if (res.status === 201) {
                toast.success("Registered successfully!");
                // Refresh auth after registration
                await refreshAuth();
                router.replace("/tasks");
            } else {
                toast.error(`Unexpected response: ${res.status}`);
            }
        } catch (err: any) {
            if (err.response) {
                const status = err.response.status;
                const message = err.response.data?.message || "Registration failed";

                switch (status) {
                    case 400:
                        toast.error("Invalid request: " + message);
                        break;
                    case 409:
                        toast.error("Email already exists. Try logging in.");
                        break;
                    case 500:
                        toast.error("Server error. Please try again later.");
                        break;
                    default:
                        toast.error(`Error ${status}: ${message}`);
                }
            } else {
                toast.error("Network error. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Show loader while auth is loading or if user exists
    if (authLoading || user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#171614] px-4">
                <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#1c1b19] px-8 py-10 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-teal-400/60 to-transparent" />

                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-cyan-400 shadow-[0_10px_30px_rgba(79,152,163,0.35)]">
                            <svg
                                className="h-7 w-7 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    d="M12 3L19 7V17L12 21L5 17V7L12 3Z"
                                    strokeLinejoin="round"
                                />
                                <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
                            </svg>
                            <div className="absolute inset-0 rounded-2xl bg-white/10" />
                        </div>

                        <div className="mb-6">
                            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
                                Starting application
                            </h1>
                            <p className="mt-2 text-sm text-zinc-400">
                                Preparing your workspace and loading essentials...
                            </p>
                        </div>

                        <div className="relative mb-6 h-11 w-11">
                            <div className="absolute inset-0 rounded-full border-[2.5px] border-white/10 border-t-teal-400 animate-spin" />
                            <div className="absolute inset-1.75 rounded-full border-2 border-white/5 border-b-cyan-300/70 animate-[spin_1.1s_linear_infinite_reverse]" />
                        </div>

                        <div className="w-full overflow-hidden rounded-full bg-white/5">
                            <div className="h-1 w-2/3 rounded-full bg-linear-to-r from-teal-500 via-cyan-400 to-teal-300 animate-pulse" />
                        </div>

                        <div className="mt-6 grid w-full gap-2 text-left">
                            <div className="flex items-center gap-3 rounded-xl bg-white/3 px-3 py-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                <span className="text-xs text-zinc-300">Session detected</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-teal-500/5 px-3 py-2">
                                <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                                <span className="text-xs text-zinc-300">Initializing app modules</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-white/3 px-3 py-2">
                                <div className="h-2 w-2 rounded-full bg-zinc-600" />
                                <span className="text-xs text-zinc-500">Finalizing interface</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render registration form only if user is not logged in
    return (
        <div className="min-h-screen bg-[#171614] px-4 py-10 text-zinc-100">
  <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#1c1b19] shadow-[0_20px_80px_rgba(0,0,0,0.45)] lg:grid-cols-2">
    
    {/* Left visual panel */}
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(79,152,163,0.18),transparent_35%),linear-gradient(180deg,#1f1d1a_0%,#171614_100%)] p-10">
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-cyan-400 shadow-[0_10px_30px_rgba(79,152,163,0.35)]">
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3L19 7V17L12 21L5 17V7L12 3Z" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-zinc-100">Nexus</span>
        </div>

        <div className="max-w-md">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-teal-300/80">
            Join the platform
          </p>
          <h2 className="text-4xl font-semibold leading-tight text-white">
            Create your account and start building faster.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            Manage your workspace, access your dashboard, and keep everything in one secure place with a calm, modern interface.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/3 p-4 backdrop-blur-sm">
          <p className="text-sm text-zinc-300">Fast onboarding</p>
          <p className="mt-1 text-xs text-zinc-500">Simple one-column form with clear focus states.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/3 p-4 backdrop-blur-sm">
          <p className="text-sm text-zinc-300">Secure access</p>
          <p className="mt-1 text-xs text-zinc-500">Protected account setup with strong visual trust cues.</p>
        </div>
      </div>
    </div>

    {/* Right form panel */}
    <div className="relative flex items-center justify-center bg-[#1c1b19] px-6 py-10 sm:px-10">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="mb-5 flex justify-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-cyan-400 shadow-[0_10px_30px_rgba(79,152,163,0.35)]">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 3L19 7V17L12 21L5 17V7L12 3Z" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Create account
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Enter your details to register and access your workspace.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-teal-400/60 focus:bg-white/5 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-teal-400/60 focus:bg-white/5 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-teal-400/60 focus:bg-white/5 focus:ring-4 focus:ring-teal-500/10"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Use at least 8 characters for better security.
            </p>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className={`group relative flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition ${
              loading
                ? "cursor-not-allowed bg-teal-400/50"
                : "bg-linear-to-r from-teal-500 to-cyan-400 shadow-[0_12px_30px_rgba(79,152,163,0.28)] hover:-translate-y-px hover:shadow-[0_16px_40px_rgba(79,152,163,0.35)]"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                Registering...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-teal-400 transition hover:text-teal-300 hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  </div>
</div>
    );
}