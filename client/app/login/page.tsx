"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user, loading: authLoading, refreshAuth } = useAuth();

    useEffect(() => {
        // If auth has finished loading and user exists, redirect to /tasks
        if (!authLoading && user) {
            router.replace("/tasks"); // replace so back button doesn't go to login
        }
    }, [user, authLoading, router]);

    const handleLogin = async () => {
        if (!email || !password) {
            toast.warn("Please enter both email and password.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/auth/login", { email, password });

            if (res.status === 200) {
                toast.success("Logged in successfully!");
                await refreshAuth();
                router.replace("/tasks"); // replace to prevent back navigation
            } else {
                toast.error(`Unexpected response: ${res.status}`);
            }
        } catch (err: any) {
            if (err.response) {
                const status = err.response.status;
                const message = err.response.data?.message || "Login failed";

                switch (status) {
                    case 400:
                        toast.error("Invalid request: " + message);
                        break;
                    case 401:
                        toast.error("Unauthorized: Incorrect email or password.");
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

    // Render login form only if user is not logged in
    return (
        <div className="min-h-screen bg-[#171614] px-4 py-10 text-zinc-100">
            <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#1c1b19] shadow-[0_20px_80px_rgba(0,0,0,0.45)] lg:grid-cols-2">

                {/* Left panel */}
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
                                Welcome back
                            </p>
                            <h2 className="text-4xl font-semibold leading-tight text-white">
                                Sign in and continue where you left off.
                            </h2>
                            <p className="mt-4 text-base leading-7 text-zinc-400">
                                Access your workspace, manage your dashboard, and get back to your flow with a clean and focused sign-in experience.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/3 p-4 backdrop-blur-sm">
                            <p className="text-sm text-zinc-300">Fast access</p>
                            <p className="mt-1 text-xs text-zinc-500">Minimal fields and a clear primary action reduce friction.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/3 p-4 backdrop-blur-sm">
                            <p className="text-sm text-zinc-300">Trusted experience</p>
                            <p className="mt-1 text-xs text-zinc-500">Strong contrast, focused layout, and visible states improve confidence.</p>
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
                                Sign in
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Enter your email and password to access your account.
                            </p>
                        </div>

                        <div className="space-y-5">
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
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-sm font-medium text-zinc-300">
                                        Password
                                    </label>

                                </div>

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-teal-400/60 focus:bg-white/5 focus:ring-4 focus:ring-teal-500/10"
                                />
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className={`relative flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition ${loading
                                        ? "cursor-not-allowed bg-teal-400/50"
                                        : "bg-linear-to-r from-teal-500 to-cyan-400 shadow-[0_12px_30px_rgba(79,152,163,0.28)] hover:-translate-y-px hover:shadow-[0_16px_40px_rgba(79,152,163,0.35)]"
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                                        Signing in...
                                    </span>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </div>

                        <p className="mt-6 text-center text-sm text-zinc-500">
                            Don&apos;t have an account?{" "}
                            <a
                                href="/register"
                                className="font-medium text-teal-400 transition hover:text-teal-300 hover:underline"
                            >
                                Create one
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}