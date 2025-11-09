//admin/events/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

interface Event {
  id: string;
  title: string;
  description: string;
  club_id: string;
  date: string;
  certificate_bg?: string;
  status?: "Pending" | "Approved" | "Rejected";
  clubs?: { name: string };
}

interface Club {
  id: string;
  name: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    club_id: "",
    date: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClub, setFilterClub] = useState("");

  // ✅ Load Events
  const loadEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const json = await res.json();
      setEvents(json.events || []);
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ Load Clubs
  const loadClubs = async () => {
    try {
      const res = await fetch("/api/clubs");
      const json = await res.json();
      setClubs(json.clubs || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadEvents();
    loadClubs();
  }, []);

  // ✅ Submit Event
  const handleCreateEvent = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ title: "", description: "", club_id: "", date: "" });
        setFormVisible(false);
        loadEvents();
      } else {
        console.error(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ Delete Event
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;

    await fetch(`/api/events/${id}`, { method: "DELETE" });
    loadEvents();
  };

  // ✅ Filter + Search
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus ? e.status === filterStatus : true;
      const matchesClub = filterClub ? e.club_id === filterClub : true;
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
        {/* <button
          onClick={() => setFormVisible(!formVisible)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {formVisible ? "Close Form" : "Create Event"}
        </button> */}
      </header>

      {/* Create Event Form */}
      {/* {formVisible && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-indigo-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <i className="fas fa-plus-circle mr-2"></i> Create New Event
            </h2>
          </div>
          <div className="p-6">
            <form className="space-y-4" onSubmit={handleCreateEvent}>
              <div>
                <label className="block text-gray-700 mb-1">Event Name</label>
                <input
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Club</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.club_id}
                  onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
                >
                  <option value="">Select Club</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-gray-500">Event ID will be auto-generated</p>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-4 items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border rounded-lg"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* <select
          value={filterClub}
          onChange={(e) => setFilterClub(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border rounded-lg"
        >
          <option value="">All Clubs</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>{club.name}</option>
          ))}
        </select> */}

        <input
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Title</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Club</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.length ? (
              filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{event.title}</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">{event.clubs?.name}</td> */}
                  <td className="px-6 py-4 whitespace-nowrap">{event.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded ${getStatusBadge(event.status || "Pending")}`}>
                      {event.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Link href={`/club/events/${event.id}`}>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md">View</button>
                    </Link>
                    {/* <button
                      onClick={() => handleDelete(event.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md"
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No events found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
