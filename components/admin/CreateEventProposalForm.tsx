"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateEventProposalFormProps {
  clubs: any[];
}

export default function CreateEventProposalForm({ clubs }: CreateEventProposalFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [docs, setDocs] = useState(""); // JSON string or comma-separated URLs
  const [clubId, setClubId] = useState(clubs[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/create-event-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          date,
          time,
          venue,
          docs: docs ? JSON.parse(docs) : [],
          club_id: clubId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create proposal");

      setSuccess("Proposal created successfully!");
      setTitle(""); setDescription(""); setDate(""); setTime(""); setVenue(""); setDocs("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="club">Club</Label>
        <select
          id="club"
          value={clubId}
          onChange={(e) => setClubId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="title">Event Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
      </div>

      <div>
        <Label htmlFor="venue">Venue</Label>
        <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="docs">Documents (JSON Array)</Label>
        <Textarea
          id="docs"
          value={docs}
          onChange={(e) => setDocs(e.target.value)}
          placeholder='e.g. ["doc1.pdf", "doc2.pdf"]'
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Create Proposal"}
      </Button>
    </form>
  );
}
