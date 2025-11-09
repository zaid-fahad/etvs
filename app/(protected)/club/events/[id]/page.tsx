"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Attendee {
  name: string;
  studentId: string;
  email: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}

interface Event {
  id: string;
  title: string;
  club_name: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  attendees?: Attendee[];
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`, { credentials: "include" });
        const data = await res.json();
        setEvent(data.event);
      } catch (err) {
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4EDE5]">
        <p className="text-gray-700 text-lg">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4EDE5]">
        <p className="text-gray-700 text-lg">Event not found.</p>
      </div>
    );
  }

  // Filter attendees if available
  const filteredAttendees = event.attendees?.filter((att) => {
    const matchesStatus = filterStatus ? att.status === filterStatus : true;
    const matchesSearch = searchQuery
      ? att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.studentId.includes(searchQuery) ||
        att.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  }) || [];

  return (
    <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 space-y-6">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center rounded-xl">
        <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
        <p className="text-gray-600">Event ID: {id}</p>
      </header>

      {/* Event Info & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Information */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center rounded-t-xl">
            <i className="fas fa-calendar-check mr-2"></i> Event Information
          </div>
          <div className="p-6 space-y-2">
            <p><strong>Title:</strong> {event.title}</p>
            <p><strong>Date:</strong> {event.date}</p>
            {/* <p><strong>Club:</strong> {event.club_name}</p> */}
            <p>
              <strong>Status:</strong>{" "}
              <span className={`px-2 py-1 rounded ${getStatusBadge(event.status)}`}>
                {event.status}
              </span>
            </p>
          </div>
        </div>

        {/* Event Actions */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center rounded-t-xl">
            <i className="fas fa-tasks mr-2"></i> Manage Event
          </div>
          <div className="p-6 flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <i className="fas fa-check mr-1"></i> Generate Certificate
            </button>
            {/* <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <i className="fas fa-times mr-1"></i> Reject
            </button> */}
          </div>
        </div>
      </div>

      {/* Attendees */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center rounded-t-xl">
          <i className="fas fa-users mr-2"></i> Attendees
        </div>

        {/* Filters */}
        <div className="p-6 flex flex-col md:flex-row gap-4 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <i className="fas fa-check mr-1"></i> Add Attendee
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <i className="fas fa-check mr-1"></i> Update Attendee Status
            </button>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                    No attendees found.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((att, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{att.name}</td>
                    <td className="px-4 py-2">{att.studentId}</td>
                    <td className="px-4 py-2">{att.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded ${getStatusBadge(att.status)}`}>{att.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
