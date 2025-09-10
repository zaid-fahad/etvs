"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

interface Event {
  id: string;
  title: string;
  club: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([
    { id: "1", title: "AI Bootcamp", club: "Tech Club", date: "Oct 15, 2023", status: "Pending" },
    { id: "2", title: "Art Workshop", club: "Arts Society", date: "Nov 5, 2023", status: "Approved" },
    { id: "3", title: "Sports Meet", club: "Athletics Club", date: "Dec 1, 2023", status: "Rejected" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClub, setFilterClub] = useState("");

  const clubs = Array.from(new Set(events.map((e) => e.club)));

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus ? e.status === filterStatus : true;
      const matchesClub = filterClub ? e.club === filterClub : true;
      return matchesSearch && matchesStatus && matchesClub;
    });
  }, [events, searchQuery, filterStatus, filterClub]);

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
      <header className="bg-white shadow-sm px-6 py-4 rounded-xl flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Events Management</h1>
        <Link href="/admin/events/new">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <i className="fas fa-plus mr-2"></i> Create Event
          </button>
        </Link>
      </header>

      {/* Create New Event */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-indigo-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <i className="fas fa-plus-circle mr-2"></i> Create New Event
          </h2>
        </div>
        <div className="p-6">
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Event Name</label>
              <input
                type="text"
                placeholder="Enter club name"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Brief description"
                className="w-full px-4 py-2 border rounded-lg"
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Club</label>
              <select className="w-full px-4 py-2 border rounded-lg">
                <option value="">Select Club</option>
                <option value="CSE">CSE</option>
                <option value="EEE">EEE</option>
                <option value="BBA">BBA</option>
                <option value="ENG">ENG</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">date</label>
              <input
                type="date"
                placeholder="date"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-gray-500">
                Event ID will be generated automatically
              </p>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>


      

      {/* Events Table */}
      
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <div className="bg-indigo-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <i className="fas fa-users mr-2"></i> All Events
          </h2>
        </div>
        {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-4  items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select
          value={filterClub}
          onChange={(e) => setFilterClub(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Clubs</option>
          {clubs.map((club) => (
            <option key={club} value={club}>{club}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.length ? (
              filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{event.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.club}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded ${getStatusBadge(event.status)}`}>{event.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Link href={`/admin/events/${event.id}`}>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <i className="fas fa-eye mr-1"></i> View
                      </button>
                    </Link>
                    <button className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">
                      <i className="fas fa-trash mr-1"></i> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
