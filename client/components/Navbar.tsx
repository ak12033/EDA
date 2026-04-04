"use client";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="p-4 bg-gray-800 text-white flex justify-between">
            <Link href="/">TaskManager</Link>
            <div className="space-x-4">
                <Link href="/login">Login</Link>
                <Link href="/register">Register</Link>
                <Link href="/tasks">Dashboard</Link>
            </div>
        </nav>
    );
}