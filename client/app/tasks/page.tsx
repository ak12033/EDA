"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";
import {
    FaUserCircle,
    FaSignOutAlt,
    FaCheck,
    FaTimes,
    FaTrash,
    FaEdit,
    FaSearch,
    FaPlus,
    FaChevronLeft,
    FaChevronRight,
    FaTasks,
    FaCheckCircle,
    FaRegClock,
    FaSave,
} from "react-icons/fa";

interface Task {
    id: number;
    title: string;
    description?: string;
    status: boolean;
}

const TASKS_PER_PAGE = 5;

export default function TasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const { user, loading: authLoading, setUser } = useAuth();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get("/task");

            const fetchedTasks = Array.isArray(res.data.data)
                ? res.data.data.map((t: any) => ({
                    ...t,
                    status: t.status === "completed",
                }))
                : [];

            setTasks(fetchedTasks);
        } catch (err) {
            console.error("Fetch tasks error:", err);
            toast.error("Failed to fetch tasks");
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else {
                fetchTasks(); // only fetch tasks if user exists
            }
        }
    }, [authLoading, user, router]);

    const handleAddTask = async () => {
        if (!title.trim()) return toast.error("Title is required");

        setLoading(true);
        try {
            await api.post("/task", {
                title: title.trim(),
                description: description.trim(),
            });
            toast.success("Task added!");
            setTitle("");
            setDescription("");
            await fetchTasks();
            setCurrentPage(1);
        } catch (err) {
            toast.error("Failed to add task");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {

        try {
            // Call backend to clear auth cookie
            await api.post("/auth/logout", {}, { withCredentials: true });
            setUser(null);
            toast.success("Logged out successfully");

            // Redirect to login
            router.push("/login");
        } catch (err) {
            console.error("Logout failed:", err);
            toast.error("Logout failed. Please try again.");
        }
    };

    const handleToggle = async (id: number) => {
        setActionLoading(id);
        try {
            await api.patch(`/task/${id}/toggle`);
            toast.success("Task status updated!");
            await fetchTasks();
        } catch (err) {
            toast.error("Failed to toggle task");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: number) => {
        setActionLoading(id);
        try {
            await api.delete(`/task/${id}`);
            toast.success("Task deleted!");
            const updatedTasks = tasks.filter((task) => task.id !== id);
            const newTotalPages = Math.max(1, Math.ceil(updatedTasks.length / TASKS_PER_PAGE));

            if (currentPage > newTotalPages) {
                setCurrentPage(newTotalPages);
            }

            await fetchTasks();
        } catch (err) {
            toast.error("Failed to delete task");
        } finally {
            setActionLoading(null);
        }
    };

    const startEditing = (task: Task) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditTitle("");
        setEditDescription("");
    };

    const handleSaveEdit = async (id: number) => {
        if (!editTitle.trim()) {
            return toast.error("Title is required");
        }

        setActionLoading(id);
        try {
            await api.patch(`/task/${id}`, {
                title: editTitle.trim(),
                description: editDescription.trim(),
            });
            toast.success("Task updated!");
            setEditingTaskId(null);
            setEditTitle("");
            setEditDescription("");
            await fetchTasks();
        } catch (err) {
            toast.error("Failed to update task");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.description || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesFilter =
                filter === "all"
                    ? true
                    : filter === "completed"
                        ? task.status
                        : !task.status;

            return matchesSearch && matchesFilter;
        });
    }, [tasks, searchTerm, filter]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status).length;
    const pendingTasks = tasks.filter((task) => !task.status).length;
    const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalPages = Math.max(1, Math.ceil(filteredTasks.length / TASKS_PER_PAGE));

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * TASKS_PER_PAGE,
        currentPage * TASKS_PER_PAGE
    );

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }

        return pages;
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#171614]">
                <div className="relative flex flex-col items-center gap-7 bg-[#1c1b19] border border-white/8 rounded-2xl p-12 w-100 shadow-2xl overflow-hidden animate-card-in">

                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-teal-400/50 to-transparent" />

                    {/* Logo */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-[14px] bg-linear-to-br from-teal-600 to-cyan-500 flex items-center justify-center shadow-[0_6px_20px_rgba(79,152,163,0.4)]">
                            {/* your SVG logo */}
                        </div>
                        <span className="font-serif text-xl text-white/90">Your App</span>
                    </div>

                    {/* Spinner */}
                    <div className="w-11 h-11 relative">
                        <div className="absolute inset-0 rounded-full border-[2.5px] border-white/10 border-t-teal-400 animate-spin" />
                        <div className="absolute inset-1.75 rounded-full border-2 border-white/6 border-b-teal-400/50 animate-[spin_1.2s_linear_infinite_reverse]" />
                    </div>

                    {/* Message */}
                    <p className="text-[15px] text-white/50 text-center">
                        Checking authentication<span>...</span>
                    </p>
                    <p className="text-[13px] text-white/25 text-center -mt-4">
                        Verifying your session securely
                    </p>

                    {/* Progress */}
                    <div className="w-full h-0.5 bg-white/7 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-teal-500 to-cyan-400 rounded-full animate-progress" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-slate-200 text-slate-900">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}


                <div className="mb-8 overflow-visible rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    {/* Top Row */}
                    <div className="flex items-center justify-between lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Left: Task Workspace badge on mobile, hidden on desktop */}
                        <div className="lg:hidden">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                                <FaTasks className="text-xs" />
                                Task Workspace
                            </div>
                        </div>

                        {/* Center: Description on desktop, hidden on mobile */}
                        <div className="hidden lg:block flex-1">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                My Tasks
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                                Organize your day with a clean, modern task dashboard featuring smart filtering,
                                inline actions, and pagination.
                            </p>
                        </div>

                        {/* Right: Profile icon */}
                        <div className="shrink-0">
                            <div className="relative group">
                                <button
                                    type="button"
                                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-slate-800 to-slate-600 text-white shadow-md">
                                        <FaUserCircle className="text-2xl" />
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-semibold text-slate-800">Profile</p>
                                        <p className="text-xs text-slate-500">Account settings</p>
                                    </div>
                                </button>

                                <div className="invisible absolute right-0 top-[calc(100%+12px)] z-50 w-52 translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-[0_20px_40px_rgba(15,23,42,0.12)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                    >
                                        <FaSignOutAlt />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Total
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{totalTasks}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                Completed
                            </p>
                            <p className="mt-2 text-2xl font-bold text-emerald-700">{completedTasks}</p>
                        </div>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                                Pending
                            </p>
                            <p className="mt-2 text-2xl font-bold text-amber-700">{pendingTasks}</p>
                        </div>
                        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                                Progress
                            </p>
                            <p className="mt-2 text-2xl font-bold text-sky-700">{completionRate}%</p>
                        </div>
                    </div>
                </div>


                <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
                    {/* Add Task Panel */}
                    <div className="h-fit rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                                <FaPlus />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Add New Task</h2>
                                <p className="text-sm text-slate-500">
                                    Capture work quickly and keep it structured.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Task title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter task title"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-black outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a short description (optional)"
                                    rows={4}
                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-black outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                />
                            </div>

                            <button
                                onClick={handleAddTask}
                                disabled={loading}
                                className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.99] ${loading ? "cursor-not-allowed opacity-60" : ""
                                    }`}
                            >
                                <FaPlus className="text-sm" />
                                {loading ? "Adding..." : "Add Task"}
                            </button>
                        </div>
                    </div>

                    {/* Tasks Section */}
                    <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                        {/* Toolbar */}
                        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Task Overview</h2>
                                <p className="text-sm text-slate-500">
                                    Search, filter, edit, complete, and manage tasks efficiently.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search tasks..."
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 sm:w-72"
                                    />
                                </div>

                                <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                                    {["all", "pending", "completed"].map((item) => (
                                        <button
                                            key={item}
                                            onClick={() =>
                                                setFilter(item as "all" | "completed" | "pending")
                                            }
                                            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${filter === item
                                                ? "bg-slate-900 text-white shadow-sm"
                                                : "text-slate-600 hover:text-slate-900"
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <FaCheckCircle className="text-emerald-500" />
                                    Completion progress
                                </div>
                                <span className="text-sm font-semibold text-slate-600">
                                    {completionRate}%
                                </span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>

                        {/* Task List */}
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5"
                                    >
                                        <div className="mb-3 h-5 w-1/3 rounded bg-slate-200" />
                                        <div className="mb-2 h-4 w-2/3 rounded bg-slate-200" />
                                        <div className="h-4 w-1/2 rounded bg-slate-200" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                                    <FaRegClock className="text-xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800">
                                    No tasks found
                                </h3>
                                <p className="mt-2 max-w-md text-sm text-slate-500">
                                    Try changing your search or filter, or add a new task to get started.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {paginatedTasks.map((task) => {
                                        const isEditing = editingTaskId === task.id;

                                        return (
                                            <div
                                                key={task.id}
                                                className={`group rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${task.status
                                                    ? "border-emerald-200 bg-linear-to-r from-emerald-50 to-white"
                                                    : "border-slate-200 bg-white"
                                                    }`}
                                            >
                                                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        {isEditing ? (
                                                            <div className="space-y-3">
                                                                <input
                                                                    type="text"
                                                                    value={editTitle}
                                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-black outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                                                />
                                                                <textarea
                                                                    value={editDescription}
                                                                    onChange={(e) =>
                                                                        setEditDescription(e.target.value)
                                                                    }
                                                                    rows={3}
                                                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-black outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                                                    <h3
                                                                        className={`text-lg font-semibold ${task.status
                                                                            ? "text-slate-400 line-through"
                                                                            : "text-slate-900"
                                                                            }`}
                                                                    >
                                                                        {task.title}
                                                                    </h3>

                                                                    <span
                                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${task.status
                                                                            ? "bg-emerald-100 text-emerald-700"
                                                                            : "bg-amber-100 text-amber-700"
                                                                            }`}
                                                                    >
                                                                        {task.status ? "Completed" : "Pending"}
                                                                    </span>
                                                                </div>

                                                                {task.description && (
                                                                    <p
                                                                        className={`max-w-2xl text-sm leading-6 ${task.status
                                                                            ? "text-slate-400 line-through"
                                                                            : "text-slate-600"
                                                                            }`}
                                                                    >
                                                                        {task.description}
                                                                    </p>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {/* Toggle */}
                                                        <button
                                                            onClick={() => handleToggle(task.id)}
                                                            disabled={actionLoading === task.id}
                                                            aria-label={
                                                                task.status
                                                                    ? "Mark as pending"
                                                                    : "Mark as completed"
                                                            }
                                                            className={`inline-flex h-11 min-w-27.5 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition ${task.status
                                                                ? "bg-emerald-600 hover:bg-emerald-700"
                                                                : "bg-slate-700 hover:bg-slate-800"
                                                                } ${actionLoading === task.id
                                                                    ? "cursor-not-allowed opacity-60"
                                                                    : ""
                                                                }`}
                                                        >
                                                            {task.status ? <FaCheck /> : <FaTimes />}
                                                            {task.status ? "Done" : "Pending"}
                                                        </button>

                                                        {/* Edit / Save */}
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSaveEdit(task.id)}
                                                                    disabled={actionLoading === task.id}
                                                                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 ${actionLoading === task.id
                                                                        ? "cursor-not-allowed opacity-60"
                                                                        : ""
                                                                        }`}
                                                                >
                                                                    <FaSave />
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={cancelEditing}
                                                                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => startEditing(task)}
                                                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-white transition hover:bg-blue-600"
                                                                aria-label="Edit task"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                        )}

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => handleDelete(task.id)}
                                                            disabled={actionLoading === task.id}
                                                            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500 text-white transition hover:bg-red-600 ${actionLoading === task.id
                                                                ? "cursor-not-allowed opacity-60"
                                                                : ""
                                                                }`}
                                                            aria-label="Delete task"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer / Pagination */}
                                <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-slate-500">
                                        Showing{" "}
                                        <span className="font-semibold text-slate-800">
                                            {filteredTasks.length === 0
                                                ? 0
                                                : (currentPage - 1) * TASKS_PER_PAGE + 1}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-semibold text-slate-800">
                                            {Math.min(currentPage * TASKS_PER_PAGE, filteredTasks.length)}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-semibold text-slate-800">
                                            {filteredTasks.length}
                                        </span>{" "}
                                        tasks
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${currentPage === 1
                                                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            <FaChevronLeft className="text-xs" />
                                            Prev
                                        </button>

                                        {getPageNumbers().map((page, index) =>
                                            page === "..." ? (
                                                <span
                                                    key={`${page}-${index}`}
                                                    className="px-2 text-sm text-slate-400"
                                                >
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page as number)}
                                                    className={`h-10 min-w-10 rounded-2xl px-3 text-sm font-semibold transition ${currentPage === page
                                                        ? "bg-slate-900 text-white shadow-md"
                                                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        )}

                                        <button
                                            onClick={() =>
                                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                            }
                                            disabled={currentPage === totalPages}
                                            className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${currentPage === totalPages
                                                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            Next
                                            <FaChevronRight className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
