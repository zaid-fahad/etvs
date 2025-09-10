"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Proposal {
  id: number;
  title: string;
  description: string;
  club_id: number;
  docs: any;
}

interface Props {
  proposals: Proposal[];
}

export default function EventProposalActions({ proposals }: Props) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleAction = async (proposalId: number, action: "approved" | "rejected") => {
    setLoadingId(proposalId);
    try {
      const remarks = action === "rejected" ? prompt("Enter rejection remarks") || "" : "";
      const res = await fetch("/api/admin/event-proposal-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, action, remarks }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");

      alert(`Proposal ${action}`);
      location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="border p-4 rounded mb-6">
      <h2 className="font-bold text-xl mb-2">Pending Event Proposals</h2>
      {proposals?.map((p) => (
        <div key={p.id} className="border p-2 rounded mb-2 flex justify-between items-center">
          <div>
            <h3 className="font-bold">{p.title}</h3>
            <p>{p.description}</p>
            <p>Club ID: {p.club_id}</p>
            <p>Docs: {JSON.stringify(p.docs)}</p>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={loadingId === p.id}
              onClick={() => handleAction(p.id, "approved")}
            >
              Approve
            </Button>
            <Button
              disabled={loadingId === p.id}
              variant="destructive"
              onClick={() => handleAction(p.id, "rejected")}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
