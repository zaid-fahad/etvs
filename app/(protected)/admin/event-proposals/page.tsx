// app/(protected)/admin/event-proposals/page.tsx
"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

interface Proposal {
  id: string;
  title: string;
  club_name: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function EventProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClub, setFilterClub] = useState("");

  // ✅ Fetch proposals from API
  useEffect(() => {
    async function fetchProposals() {
      const res = await fetch("/api/event-proposals");
      const json = await res.json();
      setProposals(json.proposals || []);
    }
    fetchProposals();
  }, []);

  // ✅ Unique club list
  const clubs = Array.from(
    new Set((proposals ?? []).map((p) => p.club_name))
  );

  // ✅ Filter logic
  const filteredProposals = useMemo(() => {
    return (proposals ?? []).filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus ? p.status === filterStatus : true;
      const matchesClub = filterClub ? p.club_name === filterClub : true;
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

  // ✅ Loading UI before proposals arrive
  if (proposals === null) {
    return (
      <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 text-lg">
        Loading proposals...
      </div>
    );
  }

  return (
    <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 space-y-6">
      <header className="bg-white shadow-sm px-6 py-4 rounded-xl flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Event Proposals</h1>
        <Link href="/admin/event-proposals/new">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Submit Proposal
          </button>
        </Link>
      </header>

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

        <select
          value={filterClub}
          onChange={(e) => setFilterClub(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border rounded-lg"
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
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Club</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProposals.length ? (
              filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{proposal.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proposal.club_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proposal.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full font-medium ${getStatusBadge(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Link href={`/admin/event-proposals/${proposal.id}`}>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Review
                      </button>
                    </Link>
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
