// (protected)/admin/clubs/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Club {
  id: string;
  name: string;
  description: string;
  department: string;
  email: string;
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    email: "",
  });

  // Fetch clubs from API
  useEffect(() => {
    async function fetchClubs() {
      const res = await fetch("/api/clubs");
      const data = await res.json();
      if (data.clubs) setClubs(data.clubs);
    }
    fetchClubs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.club) {
      setClubs((prev) => [...prev, data.club]);
      setShowForm(false);
      setFormData({ name: "", description: "", department: "", email: "" });
    } else {
      alert(data.error || "Failed to create club");
    }
  };

  const handleDeleteClub = async (id: string) => {
    if (!confirm("Are you sure you want to delete this club?")) return;
    const res = await fetch(`/api/clubs/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.club) {
      setClubs((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert(data.error || "Failed to delete club");
    }
  };

  return (
    <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 space-y-6">
      <header className="bg-white shadow-sm px-6 py-4 rounded-xl flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Club Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i> Add Club
        </button>
      </header>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-indigo-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <i className="fas fa-plus-circle mr-2"></i> Create New Club
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Club Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="CSE">CSE</option>
                  <option value="EEE">EEE</option>
                  <option value="BBA">BBA</option>
                  <option value="ENG">ENG</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  Create Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <div className="bg-indigo-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <i className="fas fa-users mr-2"></i> All Clubs
          </h2>
        </div>
        <div className="">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* <th>ID</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clubs.map((club) => (
                <tr key={club.id} className="hover:bg-gray-50">
                  {/* <td>{club.id}</td> */}
                  <td className="px-6 py-4 whitespace-nowrap">{club.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{club.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{club.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{club.email}</td>
                  <td className="space-x-2">
                    <Link href={`/admin/clubs/${club.id}`}>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Edit</button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClub(club.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {clubs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500">
                    No clubs available.
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
