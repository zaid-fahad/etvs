"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function EventProposalDetailsPage() {
  const { id } = useParams();

  const proposal = {
    title: "AI Bootcamp",
    club: "Tech Club",
    date: "Oct 15, 2023",
    status: "Pending",
    description: "An intensive bootcamp on AI and Machine Learning for students.",
    documents: [
      { name: "Proposal.pdf", url: "#" },
      { name: "Budget.xlsx", url: "#" },
    ],
  };

  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState(proposal.status);

  const handleApprove = () => {
    if (!remarks.trim()) return alert("Please add remarks before approving.");
    setStatus("Approved");
    alert("Proposal approved. Event created!");
  };

  const handleReject = () => {
    if (!remarks.trim()) return alert("Please add remarks before rejecting.");
    setStatus("Rejected");
    alert("Proposal rejected.");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-700";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Rejected": return "bg-red-100 text-red-700";
      default: return "";
    }
  };

  return (
    <div className="ml-0 min-h-screen bg-[#F4EDE5] p-6 space-y-6">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center rounded-xl">
        <h1 className="text-2xl font-bold text-gray-800">{proposal.title}</h1>
        <span className={`px-3 py-1 rounded-full font-medium ${getStatusBadge(status)}`}>
          {status}
        </span>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proposal Info */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center rounded-t-xl">
            <i className="fas fa-file-alt mr-2"></i> Proposal Information
          </div>
          <div className="p-6 space-y-2">
            <p><strong>Title:</strong> {proposal.title}</p>
            <p><strong>Club:</strong> {proposal.club}</p>
            <p><strong>Date:</strong> {proposal.date}</p>
            <p><strong>Description:</strong> {proposal.description}</p>
          </div>
        </div>

        {/* Attached Documents */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center rounded-t-xl">
            <i className="fas fa-paperclip mr-2"></i> Attached Documents
          </div>
          <div className="p-6 flex flex-col gap-3">
            {proposal.documents.map((doc, idx) => (
              <a
                key={idx}
                href={doc.url}
                target="_blank"
                className="flex items-center px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <i className="fas fa-file mr-3 text-gray-600"></i> {doc.name}
              </a>
            ))}
          </div>
        </div>

        {/* Review & Action */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md">
          <div className="bg-indigo-700 px-6 py-4 text-white font-semibold flex items-center rounded-t-xl">
            <i className="fas fa-check-circle mr-2"></i> Review & Action
          </div>
          <div className="p-6 space-y-4">
            <textarea
              placeholder="Add remarks before approving/rejecting..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none h-28"
            />
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleApprove}
                className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <i className="fas fa-check mr-2"></i> Approve & Create Event
              </button>
              <button
                onClick={handleReject}
                className="px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <i className="fas fa-times mr-2"></i> Reject Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
