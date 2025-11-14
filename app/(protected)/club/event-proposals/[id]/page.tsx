"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Attachment {
  name: string;
  url: string;
}

interface Remark {
  text: string;
  created_at: string;
  added_by?: string;
}

interface Proposal {
  id: string;
  title: string;
  club_name: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected" | "Draft" | "OnHold";
  description: string;
  budget: string;
  attachments: Attachment[];
  remarks: Remark[]; // JSONB array
}

export default function EventProposalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [newRemark, setNewRemark] = useState("");
  const [status, setStatus] = useState<Proposal["status"]>("Pending");
  const [loading, setLoading] = useState(true);

  // Fetch proposal details
  useEffect(() => {
    async function fetchProposal() {
      const res = await fetch(`/api/event-proposals/${id}`);
      const json = await res.json();
      setProposal(json.proposal);
      setStatus(json.proposal.status);
      setLoading(false);
    }
    fetchProposal();
  }, [id]);

  if (loading || !proposal) return <div className="p-6">Loading...</div>;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Draft":
        return "bg-gray-100 text-gray-700";
      case "OnHold":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "";
    }
  };

  const handleSave = async () => {
    if (!newRemark.trim()) return alert("Please add a remark");

    const updatedRemarks = [
      ...(proposal.remarks || []),
      {
        text: newRemark,
        created_at: new Date().toISOString(),
        added_by: "admin",
      }, // replace with current user if available
    ];

    const res = await fetch(`/api/event-proposals/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, remarks: updatedRemarks }),
    });

    if (res.ok) {
      const json = await res.json();
      setProposal(json.proposal);
      setNewRemark("");
      alert(`Proposal saved as ${status}`);
    } else {
      alert("Error saving proposal");
    }
  };

  return (
    <div className="ml-0 min-h-screen  p-6">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center rounded-xl mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{proposal.title}</h1>
        <span
          className={`px-3 py-1 rounded-full font-medium ${getStatusBadge(
            proposal.status
          )}`}
        >
          {proposal.status}
        </span>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Details + Attachments + Remarks History */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Proposal Info */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-indigo-700 text-white px-6 py-3 font-semibold justify-between flex items-center">
              Proposal Details
              <button
                onClick={() =>
                  router.push(`${proposal.id}/edit`)
                }
                className="px-5 py-2 bg-white text-black rounded-lg hover:bg-yellow-500"
              >
                Edit Proposal
              </button>
            </div>
            <div className="p-6 space-y-2">
              <p>
                <b>Club:</b> {proposal.club_name}
              </p>
              <p>
                <b>Date:</b> {proposal.date}
              </p>
              <p>
                <b>Budget:</b> {proposal.budget}
              </p>
              <p>
                <b>Description:</b> {proposal.description}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {proposal.attachments && proposal.attachments.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-indigo-700 text-white px-6 py-3 font-semibold">
                Attachments
              </div>
              <div className="p-6 flex flex-col gap-2">
                {proposal.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <i className="fas fa-file-alt"></i> {att.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Remarks History */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-indigo-700 text-white px-6 py-3 font-semibold">
              Remarks History
            </div>
            <div className="p-6 flex flex-col gap-3 max-h-80 overflow-y-auto">
              {(proposal.remarks || [])
                .slice()
                .reverse()
                .map((r, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 p-3 rounded border border-gray-200"
                  >
                    <p className="text-gray-800">{r.text}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(r.created_at).toLocaleString()}
                      {r.added_by ? ` — ${r.added_by}` : ""}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Status + New Remark Input */}
        <div className="lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Update Status</h2>
            <textarea
              className="w-full p-3 border rounded-lg resize-none h-28"
              placeholder="Add a new remark…"
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
            />
            {/* <select
              disabled
              className="border p-2 rounded w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value as Proposal["status"])}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Draft">Draft</option>
              <option value="OnHold">OnHold</option>
            </select> */}

            <button
              onClick={handleSave}
              className="w-full mt-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
