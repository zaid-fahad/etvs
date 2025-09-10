"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Club {
  id: number;
  name: string;
}

interface Props {
  clubs: Club[];
}

export default function ClubLoginForm({ clubs }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [clubId, setClubId] = useState(clubs?.[0]?.id || 0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/create-club-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, club_id: clubId, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create club login");

      setSuccess(`Club manager "${data.profile.name}" created successfully!`);
      setEmail(""); setPassword(""); setName(""); setClubId(clubs[0]?.id || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded mb-6">
      <h2 className="font-bold text-xl mb-2">Add Club Login</h2>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="grid gap-1">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Club</Label>
          <select value={clubId} onChange={(e) => setClubId(Number(e.target.value))}>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Club Login"}
        </Button>
      </form>
    </div>
  );
}
