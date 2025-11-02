// app/api/event-proposals/[id]/approve/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { status, remarks } = await req.json();
  if (!["Approved", "Rejected"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const supabase = await createClient();

  const { data, error } = await supabase.from("events_proposals").update({ status, remarks }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (status === "Approved") {
    await supabase.from("events").insert({
      title: data.title,
      club_id: data.club_id,
      description: data.description,
      date: data.date,
      certificate_bg: data.certificate_bg,
    });
  }

  return NextResponse.json({ success: true, proposal: data });
}
