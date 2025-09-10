"use client";

import { useState, useMemo } from "react";
import CreateClubForm from "./CreateClubForm";
import ClubLoginForm from "./ClubLoginForm";
import CreateEventProposalForm from "./CreateEventProposalForm";
import EventProposalActions from "./EventProposalAction";

export default function Tabs({ clubs, clubLogins, proposals, students }: any) {
  const [activeTab, setActiveTab] = useState("clubs");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClubs = useMemo(
    () => clubs.filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [clubs, searchQuery]
  );
  const filteredClubLogins = useMemo(
    () => clubLogins.filter((c: any) => c.email.toLowerCase().includes(searchQuery.toLowerCase())),
    [clubLogins, searchQuery]
  );
  const filteredProposals = useMemo(
    () => proposals.filter((p: any) => p.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [proposals, searchQuery]
  );
  const filteredStudents = useMemo(
    () =>
      students.filter(
        (s: any) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.student_id.includes(searchQuery) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [students, searchQuery]
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "clubs":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">Create Club</h2>
              <CreateClubForm />
            </div>
            <div className="bg-white p-6 rounded shadow overflow-auto max-h-[60vh]">
              <h2 className="text-xl font-bold mb-2">Clubs Listing</h2>
              <input
                type="text"
                placeholder="Search clubs..."
                className="w-full mb-3 p-2 border rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <table className="table-auto w-full border-collapse border text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="border px-3 py-2">ID</th>
                    <th className="border px-3 py-2">Name</th>
                    <th className="border px-3 py-2">Description</th>
                    <th className="border px-3 py-2">Contact</th>
                    <th className="border px-3 py-2">Logo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClubs.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{c.id}</td>
                      <td className="border px-3 py-2">{c.name}</td>
                      <td className="border px-3 py-2">{c.description}</td>
                      <td className="border px-3 py-2">{c.contact}</td>
                      <td className="border px-3 py-2">
                        {c.logo ? <img src={c.logo} className="h-8 w-8 rounded object-cover" /> : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "clubLogins":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">Create Club Login</h2>
              <ClubLoginForm clubs={clubs} />
            </div>
            <div className="bg-white p-6 rounded shadow overflow-auto max-h-[60vh]">
              <h2 className="text-xl font-bold mb-2">Club Logins</h2>
              <input
                type="text"
                placeholder="Search logins..."
                className="w-full mb-3 p-2 border rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <table className="table-auto w-full border-collapse border text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="border px-3 py-2">ID</th>
                    <th className="border px-3 py-2">Email</th>
                    <th className="border px-3 py-2">Club</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClubLogins.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{c.id}</td>
                      <td className="border px-3 py-2">{c.email}</td>
                      <td className="border px-3 py-2">{c.club.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "eventProposals":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">Create New Proposal</h2>
              <CreateEventProposalForm clubs={clubs} />
            </div>
            <div className="bg-white p-6 rounded shadow overflow-auto max-h-[60vh]">
              <h2 className="text-xl font-bold mb-2">Pending Event Proposals</h2>
              <input
                type="text"
                placeholder="Search proposals..."
                className="w-full mb-3 p-2 border rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <EventProposalActions proposals={filteredProposals} />
            </div>
          </div>
        );

      case "students":
        return (
          <div className="bg-white p-6 rounded shadow overflow-auto max-h-[70vh]">
            <h2 className="text-xl font-bold mb-2">Students & Attendance</h2>
            <input
              type="text"
              placeholder="Search students..."
              className="w-full mb-3 p-2 border rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <table className="table-auto w-full border-collapse border text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border px-3 py-2">Student ID</th>
                  <th className="border px-3 py-2">Name</th>
                  <th className="border px-3 py-2">Email</th>
                  <th className="border px-3 py-2">Attendance Count</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{s.student_id}</td>
                    <td className="border px-3 py-2">{s.name}</td>
                    <td className="border px-3 py-2">{s.email}</td>
                    <td className="border px-3 py-2 text-center">{s.attendances?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs Navigation */}
      <div className="flex gap-4 border-b mb-4 flex-wrap">
        {["clubs", "clubLogins", "eventProposals", "students"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-t ${
              activeTab === tab ? "bg-white shadow" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "clubs" && "Clubs"}
            {tab === "clubLogins" && "Club Logins"}
            {tab === "eventProposals" && "Event Proposals"}
            {tab === "students" && "Students & Attendance"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
