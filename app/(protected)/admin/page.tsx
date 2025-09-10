"use client";

import Link from "next/link";

export default function DashboardPage() {
  // Example data for quick stats
  const stats = [
    { title: "Total Clubs", value: 24, icon: "fas fa-users", color: "indigo" },
    { title: "Pending Events", value: 8, icon: "fas fa-calendar-alt", color: "yellow" },
    { title: "Active Students", value: "1,245", icon: "fas fa-user-graduate", color: "green" },
    { title: "Recent Attendance", value: "87%", icon: "fas fa-clipboard-check", color: "blue" },
  ];

  const recentEvents = [
    { id: "1", title: "AI Bootcamp", club: "Tech Club", status: "Pending" },
    { id: "2", title: "Art Workshop", club: "Arts Society", status: "Approved" },
    { id: "3", title: "Sports Meet", club: "Athletics Club", status: "Rejected" },
  ];

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

  return (
    <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 space-y-6">
      {/* Header */}
      <header className="bg-white shadow-sm rounded-xl">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">{stat.title}</p>
                <h3 className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600`}>
                <i className={`${stat.icon} text-xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Event Proposals */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <div className="bg-indigo-700 px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <i className="fas fa-file-alt mr-2"></i> Recent Event Proposals
          </h2>
        </div>
        <div className="p-6">
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
                  <td className="px-6 py-4 whitespace-nowrap">{event.club}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded ${getStatusBadge(event.status)}`}>{event.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Link href={`/admin/event-proposals/${event.id}`}>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <i className="fas fa-eye mr-1"></i> Review
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
