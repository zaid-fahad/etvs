// app/api/event-proposals/[id]/approve/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { create } from "domain";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const { status, remarks } = await req.json();

  const validStatuses = ["Approved", "Rejected", "Draft", "OnHold", "Pending"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = await createClient();

  // Update proposal status and remarks JSONB array
  const { data: updatedProposal, error: updateError } = await supabase
    .from("event_proposals")
    .update({ status, remarks })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // Auto-create event only if approved
  if (status === "Approved") {
    const { error: insertError } = await supabase.from("events").insert({
      title: updatedProposal.title,
      club_id: updatedProposal.club_id,
      description: updatedProposal.description,
      date: updatedProposal.date,
      certificate_bg_url: updatedProposal.certificate_bg || null,
      created_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error("Error creating event:", insertError);
    }
  }

  // Fetch updated proposal with club name
  const { data: proposalWithClub, error: fetchError } = await supabase
    .from("event_proposals")
    .select("*, club:clubs(name)")
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 400 });
  }

  const proposal = proposalWithClub
    ? { ...proposalWithClub, club_name: proposalWithClub.club?.name }
    : null;

  return NextResponse.json({ success: true, proposal });
}
