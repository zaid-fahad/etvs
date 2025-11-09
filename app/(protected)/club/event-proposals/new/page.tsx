"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Club {
  id: string;
  name: string;
}

interface Attachment {
  name: string;
  url: string;
}

export default function NewEventProposalPage() {
  const router = useRouter();

  const [club, setClub] = useState<Club | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([{ name: "", url: "" }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileAndClub() {
      try {
        // 1️⃣ Fetch profile to get club_id
        const profileRes = await fetch("/api/auth/user");
        const profileData = await profileRes.json();

        if (!profileData?.profile?.club_id) {
          setClub(null);
          setLoading(false);
          return;
        }

        const clubId = profileData.profile.club_id;

        // 2️⃣ Fetch club details using club_id
        const clubRes = await fetch(`/api/clubs/${clubId}`);
        const clubData = await clubRes.json();

        if (clubData?.club) {
          setClub({
            id: clubData.club.id,
            name: clubData.club.name,
          });
        } else {
          setClub({ id: clubId, name: "Unknown Club" });
        }
      } catch (err) {
        console.error("Failed to fetch profile or club:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndClub();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!club?.id) {
      alert("You are not associated with any club.");
      return;
    }

    const res = await fetch("/api/event-proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        club_id: club.id,
        attachments,
        date,
      }),
    });

    if (res.ok) {
      router.push("/club/event-proposals");
    } else {
      const err = await res.json();
      alert("Error: " + (err.error || "Unknown"));
    }
  };

  const addAttachment = () => {
    setAttachments([...attachments, { name: "", url: "" }]);
  };

  const removeAttachment = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated.length ? updated : [{ name: "", url: "" }]);
  };

  const updateAttachment = (index: number, field: keyof Attachment, value: string) => {
    const updated = [...attachments];
    updated[index][field] = value;
    setAttachments(updated);
  };

  if (loading) return <div className="p-6">Loading profile and club info...</div>;

  return (
    <div className="min-h-screen bg-[#F4EDE5] p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-xl font-bold mb-4">Create Event Proposal</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border p-2 rounded h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

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

          {/* Club (auto-filled) */}
          <div>
            <label className="block text-sm font-medium mb-1">Club</label>
            <input
              className="w-full border p-2 rounded bg-gray-100"
              value={club ? `${club.name}` : "No club assigned"}
              disabled
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium mb-2">Attachments (URL links)</label>
            {attachments.map((att, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  className="w-1/3 border p-2 rounded"
                  placeholder="File Name"
                  value={att.name}
                  onChange={(e) => updateAttachment(index, "name", e.target.value)}
                />
                <input
                  className="w-2/3 border p-2 rounded"
                  placeholder="https://document-link"
                  value={att.url}
                  onChange={(e) => updateAttachment(index, "url", e.target.value)}
                />
                <button
                  type="button"
                  className="px-2 text-red-600"
                  onClick={() => removeAttachment(index)}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addAttachment}
              className="mt-2 px-4 py-2 bg-gray-200 rounded"
            >
              + Add Another File
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
          >
            Submit Proposal
          </button>
        </form>
      </div>
    </div>
  );
}
