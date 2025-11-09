"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Proposal {
  id: string;
  club_id: string;
  title: string;
  description: string | null;
  requested_budget: number | null;
  attachments: {
    url: string;
    name: string;
  }[];
  status: string;
  remarks: {
    text: string;
    added_by: string;
    created_at: string;
  }[] | null;
  created_by: string;
  created_at: string;
  date: string;

  // joined relation
  clubs?: {
    name: string;
  };

  // computed / fallback
  club_name?: string;
}


async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Invalid JSON from API:", text);
    return {};
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClubs: 0,
    pendingEvents: 0,
    activeStudents: 0,
    recentAttendance: "0%",
  });

  const [recentEvents, setRecentEvents] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [usersRes, clubsRes, proposalsRes] = await Promise.all([
          fetch("/api/user"),
          fetch("/api/clubs" ),
          fetch("/api/event-proposals"),
        ]);

        const { users = [] } = await safeJson(usersRes);
        const { clubs = [] } = await safeJson(clubsRes);
        const { proposals = [] } = await safeJson(proposalsRes);

        

        // filter students and pending proposals
        const students = users.filter((u: User) => u.role === "student");
        const pendingEvents = proposals.filter( (p: Proposal)=> p.status === "Pending");

        setStats({
          totalClubs: clubs.length,
          pendingEvents: pendingEvents.length,
          activeStudents: students.length,
          recentAttendance: "87%", // placeholder
        });

        setRecentEvents(proposals.slice(0, 5));
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4EDE5]">
        <p className="text-gray-700 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 space-y-6">
      <header className="bg-white shadow-sm rounded-xl">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-500">Total Clubs</p>
          <h3 className="text-3xl font-bold text-indigo-600">{stats.totalClubs}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-500">Pending Events</p>
          <h3 className="text-3xl font-bold text-yellow-600">{stats.pendingEvents}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-500">Active Students</p>
          <h3 className="text-3xl font-bold text-green-600">{stats.activeStudents}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-500">Recent Attendance</p>
          <h3 className="text-3xl font-bold text-blue-600">{stats.recentAttendance}</h3>
        </div>
      </div>

      {/* Recent Event Proposals */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <div className="bg-indigo-700 px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-semibold text-white">Recent Event Proposals</h2>
        </div>
        <div className="">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{event.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.club_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded ${getStatusBadge(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Link href={`/admin/event-proposals/${event.id}`}>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Review
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {recentEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No event proposals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
