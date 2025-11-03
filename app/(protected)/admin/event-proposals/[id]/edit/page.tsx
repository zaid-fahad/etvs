"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";

interface Attachment {
  name: string;
  url: string;
}

interface Proposal {
  id: string;
  title: string;
  club_id: string;
  club_name: string;
  description: string;
  budget: string;
  date: string;
  attachments: Attachment[];
}

interface Club {
  id: string;
  name: string;
}

export default function EditEventProposalPage() {
  const { id } = useParams();
  const router = useRouter();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [clubId, setClubId] = useState("");
  const [date, setDate] = useState(""); 
  const [attachments, setAttachments] = useState<Attachment[]>([{ name: "", url: "" }]);
  const [loading, setLoading] = useState(true);

  // Fetch proposal + clubs
  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`/api/event-proposals/${id}`),
          fetch("/api/clubs")
        ]);

        const pJson = await pRes.json();
        const cJson = await cRes.json();

        if (pJson.proposal) {
          setProposal(pJson.proposal);
          setTitle(pJson.proposal.title || "");
          setDescription(pJson.proposal.description || "");
          // setBudget(pJson.proposal.budget || "");
          setClubId(pJson.proposal.club_id || "");
          setDate(pJson.proposal.date || "");
          setAttachments(pJson.proposal.attachments || [{ name: "", url: "" }]);
        }

        setClubs(cJson.clubs || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const addAttachment = () => setAttachments([...attachments, { name: "", url: "" }]);
  const removeAttachment = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated.length ? updated : [{ name: "", url: "" }]);
  };
  const updateAttachment = (index: number, field: keyof Attachment, value: string) => {
    const updated = [...attachments];
    updated[index][field] = value;
    setAttachments(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/event-proposals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, club_id: clubId, date, attachments }),
    });

    if (res.ok) router.push(`/admin/event-proposals/${id}`);
    else alert("Error updating proposal");
  };

  const handleCancel = () => {
    router.push(`/admin/event-proposals/${id}`);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F4EDE5] p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Event Proposal</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              className="w-full border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              className="w-full border p-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              required
            />
          </div>

          {/* Budget */}
          {/* <div>
            <label className="block font-medium mb-1">Budget</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Budget"
              required
            />
          </div> */}

          {/* Date */}
          <div>
            <label className="block font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={date || ""}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Club Dropdown */}
          <div>
            <label className="block font-medium mb-1">Club</label>
            <select
              className="w-full border p-2 rounded"
              value={clubId || ""}
              onChange={(e) => setClubId(e.target.value)}
              required
            >
              <option value="">Select club</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </select>
          </div>

          {/* Attachments */}
          <div>
            <label className="block font-medium mb-1">Attachments</label>
            {attachments.map((att, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  className="flex-1 border p-2 rounded"
                  placeholder="File Name"
                  value={att.name || ""}
                  onChange={(e) => updateAttachment(idx, "name", e.target.value)}
                />
                <input
                  className="flex-2 border p-2 rounded"
                  placeholder="https://document-link"
                  value={att.url || ""}
                  onChange={(e) => updateAttachment(idx, "url", e.target.value)}
                />
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => removeAttachment(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAttachment}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              + Add Attachment
            </button>
          </div>

          {/* Save + Cancel Buttons */}
          <div className="flex gap-4">

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-5 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
