import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { proposalId, action, remarks } = await req.json();

  // Update proposal status
  const { data: proposal, error: updateError } = await supabase
    .from("events_proposals")
    .update({ status: action, remarks })
    .eq("id", proposalId)
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  // If approved, create the event
  if (action === "approved") {
    const { error: insertError } = await supabase.from("events").insert({
      club_id: proposal.club_id,
      title: proposal.title,
      date: proposal.date,
      time: proposal.time,
      venue: proposal.venue,
      description: proposal.description,
      docs: proposal.docs,
      banner_url: proposal.banner_url,
      public: true,
    });

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ proposal });
}
