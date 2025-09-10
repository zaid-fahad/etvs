"use client";

import Link from "next/link";
import { useState } from "react";

interface Club {
  id: string;
  name: string;
  description: string;
  department: string;
  email: string;
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([
    {
      id: "1",
      name: "Tech Club",
      description: "AI, Robotics, Coding",
      department: "CSE",
      email: "techclub@university.edu",
    },
    {
      id: "2",
      name: "Arts Society",
      description: "Music, Painting, Drama",
      department: "ENG",
      email: "arts@university.edu",
    },
    {
      id: "3",
      name: "Athletics Club",
      description: "Sports and Fitness",
      department: "CSE",
      email: "athletics@university.edu",
    },
  ]);

  return (
    <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 space-y-6">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 rounded-xl flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Club Management</h1>
        <Link href="/admin/events/new">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <i className="fas fa-plus mr-2"></i> Create Club
          </button>
        </Link>
      </header>

      {/* Create New Club */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-indigo-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <i className="fas fa-plus-circle mr-2"></i> Create New Club
          </h2>
        </div>
        <div className="p-6">
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Club Name</label>
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
              <label className="block text-gray-700 mb-1">Department</label>
              <select className="w-full px-4 py-2 border rounded-lg">
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
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-gray-500">
                Club ID will be generated automatically
              </p>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Create Club
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* List of Clubs */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <div className="bg-indigo-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <i className="fas fa-users mr-2"></i> All Clubs
          </h2>
        </div>
        <div className="p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clubs.map((club) => (
                <tr key={club.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {club.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {club.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {club.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {club.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {club.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link href={`/admin/clubs/${club.id}`}>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <i className="fas fa-edit mr-1"></i> Edit
                      </button>
                    </Link>
                    <button className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">
                      <i className="fas fa-trash mr-1"></i> Delete
                    </button>
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
