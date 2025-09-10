"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

interface Proposal {
  id: string;
  title: string;
  club: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function EventProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([
    { id: "1", title: "AI Bootcamp Proposal", club: "Tech Club", date: "Oct 15, 2023", status: "Pending" },
    { id: "2", title: "Art Workshop Proposal", club: "Arts Society", date: "Nov 5, 2023", status: "Pending" },
    { id: "3", title: "Sports Meet Proposal", club: "Athletics Club", date: "Dec 1, 2023", status: "Rejected" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClub, setFilterClub] = useState("");

  const clubs = Array.from(new Set(proposals.map((p) => p.club)));

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus ? p.status === filterStatus : true;
      const matchesClub = filterClub ? p.club === filterClub : true;
      return matchesSearch && matchesStatus && matchesClub;
    });
  }, [proposals, searchQuery, filterStatus, filterClub]);

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
        <h1 className="text-2xl font-bold text-gray-800">Event Proposals</h1>
        <Link href="/admin/event-proposals/new">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <i className="fas fa-plus mr-2"></i> Submit Proposal
          </button>
        </Link>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-4 items-center">
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

      {/* Proposals Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
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
            {filteredProposals.length ? (
              filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{proposal.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proposal.club}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proposal.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded ${getStatusBadge(proposal.status)}`}>{proposal.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Link href={`/admin/event-proposals/${proposal.id}`}>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <i className="fas fa-eye mr-1"></i> Review
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
                  No proposals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
