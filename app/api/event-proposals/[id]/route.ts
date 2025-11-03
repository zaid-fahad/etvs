import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch proposal with club name and attachments
  const { data, error } = await supabase
    .from("event_proposals")
    .select("*, club:clubs(name)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const proposal = data ? { ...data, club_name: data.club?.name } : null;
  return NextResponse.json({ proposal });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const { title, description, club_id, attachments, date } = body;

  const supabase = await createClient();

  // Update proposal
  const { data, error } = await supabase
    .from("event_proposals")
    .update({ title, description, club_id, attachments, date })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Return updated proposal with club_name
  const { data: updatedData } = await supabase
    .from("event_proposals")
    .select("*, club:clubs(name)")
    .eq("id", id)
    .single();

  const proposal = updatedData ? { ...updatedData, club_name: updatedData.club?.name } : null;

  return NextResponse.json({ proposal });
}
