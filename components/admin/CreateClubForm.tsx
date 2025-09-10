"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function CreateClubForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/create-club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, logo_url: logo, contact_info: contact }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create club");

      setSuccess(`Club "${data.club.name}" created successfully!`);
      setName(""); setDescription(""); setLogo(""); setContact("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded mb-6">
      <h2 className="font-bold text-xl mb-2">Create Club</h2>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="grid gap-1">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Logo URL</Label>
          <Input value={logo} onChange={(e) => setLogo(e.target.value)} />
        </div>
        <div className="grid gap-1">
          <Label>Contact Info</Label>
          <Input value={contact} onChange={(e) => setContact(e.target.value)} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Club"}
        </Button>
      </form>
    </div>
  );
}
