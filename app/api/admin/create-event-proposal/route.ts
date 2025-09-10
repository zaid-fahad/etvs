import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { title, description, date, time, venue, docs, club_id } = await req.json();

    if (!title || !club_id) {
      return NextResponse.json({ error: "Title and Club are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("events_proposals")
      .insert({
        title,
        description,
        date,
        time,
        venue,
        docs, // JSONB array
        club_id,
        status: "pending",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: "Proposal created successfully", proposal: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
