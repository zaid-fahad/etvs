// app/api/event-proposals/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Select all fields from event_proposals and also fetch club name
  const { data, error } = await supabase
    .from("event_proposals")
    .select(`
      *,
      clubs:club_id (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Flatten club name for easier use on the frontend
  const proposals = data.map((p: any) => ({
    ...p,
    club_name: p.clubs?.name || "",
  }));

  return NextResponse.json({ proposals });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, club_id, attachments, date } = body;

  // Validate fields
  if (!title || !description  || !club_id) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Insert proposal
  const { data, error } = await supabase
    .from("event_proposals")
    .insert([
      {
        title,
        description,
        // budget,
        club_id,
        attachments: attachments || [],
        status: "Pending",
        created_by: user.id,
        date: date,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ proposal: data }, { status: 201 });
}
