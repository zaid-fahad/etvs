"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-[#F4EDE5] min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "sidebar fixed inset-y-0 left-0 w-64 bg-indigo-800 text-white shadow-lg transition-transform md:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex items-center space-x-3 border-b border-indigo-700">
          <i className="fas fa-user-shield text-2xl"></i>
          <h1 className="text-xl font-bold">Admin Portal</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700"
              >
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/clubs"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700"
              >
                <i className="fas fa-users"></i>
                <span>Clubs</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/events"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700"
              >
                <i className="fas fa-calendar-check"></i>
                <span>Events</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/event-proposals"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700"
              >
                <i className="fas fa-file-alt"></i>
                <span>Proposals</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <i className="fas fa-user"></i>
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-indigo-300">admin@university.edu</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-indigo-600 text-white p-2 rounded-lg"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Main content */}
      <main className="ml-0 md:ml-64 flex-1">{children}</main>
    </div>
  );
}
