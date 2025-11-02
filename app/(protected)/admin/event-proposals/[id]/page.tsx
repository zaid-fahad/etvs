"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Proposal {
  id: string;
  title: string;
  club_name: string;
  date: string;
  description?: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function ProposalPage() {
  const { id } = useParams();
  const router = useRouter();

  const isNew = id === "new";

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [title, setTitle] = useState("");
  const [clubName, setClubName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  // ✅ Fetch existing proposal when editing/viewing
  useEffect(() => {
    if (isNew) return;

    async function loadProposal() {
      const res = await fetch(`/api/event-proposals/${id}`);
      const json = await res.json();
      if (!res.ok) return alert(json.error);

      setProposal(json.proposal);
      setTitle(json.proposal.title);
      setClubName(json.proposal.club_name);
      setDate(json.proposal.date);
      setDescription(json.proposal.description || "");
    }

    loadProposal();
  }, [id, isNew]);

  // ✅ Handle new proposal submission
  async function handleSubmit(e: any) {
    e.preventDefault();
    const res = await fetch(`/api/event-proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, club_name: clubName, date, description }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Proposal submitted!");
      router.push("/admin/event-proposals");
    } else {
      alert(data.error);
    }
  }

  if (!isNew && !proposal)
    return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-[#F4EDE5] min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold">
          {isNew ? "Submit New Proposal" : "Review Proposal"}
        </h2>

        {isNew ? (
          // ✅ New Proposal Form
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full border p-2 rounded"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Club Name"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              required
            />

            <input
              type="date"
              className="w-full border p-2 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <textarea
              className="w-full border p-2 rounded"
              placeholder="Event Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button className="bg-indigo-600 text-white px-4 py-2 rounded w-full">
              Submit
            </button>
          </form>
        ) : (
          // ✅ Display Proposal Details (Review Mode)
          <div className="space-y-3">
            <p><b>Title:</b> {proposal?.title}</p>
            <p><b>Club:</b> {proposal?.club_name}</p>
            <p><b>Date:</b> {proposal?.date}</p>
            <p><b>Description:</b> {proposal?.description}</p>
            <p><b>Status:</b> {proposal?.status}</p>

            <div className="flex gap-4 pt-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={async () => {
                  await fetch(`/api/event-proposals/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: "Approved" }),
                  });
                  alert("Approved!");
                  router.refresh();
                }}>
                Approve
              </button>

              <button className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={async () => {
                  await fetch(`/api/event-proposals/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: "Rejected" }),
                  });
                  alert("Rejected!");
                  router.refresh();
                }}>
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
