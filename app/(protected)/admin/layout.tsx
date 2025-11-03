"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUser,
  faTachometerAlt,
  faUsers,
  faCalendarCheck,
  faFileAlt,
  faUserShield,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { cn } from "@/lib/utils";
import { LogoutButton } from "@/app/auth/components/logout-button";
import { UpdatePasswordForm } from "@/app/auth/components/update-password-form";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; full_name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/user");
        if (!res.ok) return (window.location.href = "/auth/login");

        const data = await res.json();
        const profile = data.profile;
        if (!profile || profile.role !== "admin") return (window.location.href = "/auth/error");

        setUser({
          email: data.user.email,
          full_name: profile.full_name || "Admin User",
          role: profile.role,
        });
      } catch (err) {
        console.error(err);
        window.location.href = "/auth/login";
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4EDE5]">
        <p className="text-gray-700 text-lg">Loading...</p>
      </div>
    );

  const menuItems = [
    { href: "/admin", icon: faTachometerAlt, label: "Dashboard" },
    { href: "/admin/clubs", icon: faUsers, label: "Clubs" },
    { href: "/admin/events", icon: faCalendarCheck, label: "Events" },
    { href: "/admin/event-proposals", icon: faFileAlt, label: "Proposals" },
  ];

  const handleTogglePasswordForm = () => setShowPasswordForm((prev) => !prev);

  return (
    <div className="flex min-h-screen bg-[#F4EDE5]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-indigo-800 text-white shadow-lg transform transition-transform duration-300 z-40 flex flex-col",
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div>
          <div className="p-4 flex items-center space-x-3 border-b border-indigo-700">
            <FontAwesomeIcon icon={faUserShield} className="text-2xl" />
            <h1 className="text-xl font-bold truncate">Admin Portal</h1>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-indigo-700 truncate"
                  >
                    <FontAwesomeIcon icon={item.icon} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 md:left-64 bg-white shadow-md z-50 flex items-center justify-between px-4 md:px-6 h-16">
        {/* Left: Mobile menu toggle */}
        <div className="flex items-center space-x-4">
          <button
            className="md:hidden p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <h1 className="font-bold text-lg md:hidden truncate">Admin Portal</h1>
        </div>

        
        {/* Right: User profile */}
{user && (
  <div className="relative">
    <button
      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
    >
      <FontAwesomeIcon icon={faUser} />
      <span className="hidden md:inline-block truncate">{user.full_name}</span>
      <FontAwesomeIcon
        icon={faChevronDown}
        className={cn("transition-transform", profileMenuOpen && "rotate-180")}
      />
    </button>

    {profileMenuOpen && (
      <div className="absolute right-0  bg-white text-gray-800 rounded shadow-lg w-48 flex flex-col z-50">
        <Link
          href="/admin/update-password"
          className="px-4 py-2 hover:bg-gray-100 text-left w-full"
        >
          Change Password
        </Link>
        <div className="px-4 py-2 hover:bg-gray-100 text-left w-full">
          <LogoutButton />
        </div>
      </div>
    )}
  </div>
)}

      </header>

      {/* Mobile menu overlay */}
      {menuOpen && <div className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden" onClick={() => setMenuOpen(false)} />}

      {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 mt-16 p-6 transition-all duration-300">{children}</main>
    </div>
  );
}
