// app/api/event-proposals/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, club_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 400 });
  }

  let query = supabase
    .from("event_proposals")
    .select(
      `
      *,
      clubs:club_id (
        name
      )
    `
    )
    .order("created_at", { ascending: false });

  // If user is not admin, restrict to their club
  if (profile.role !== "admin") {
    query = query.eq("club_id", profile.club_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Flatten club name for easier frontend use
  const proposals = data.map((p: any) => ({
    ...p,
    club_name: p.clubs?.name || "",
  }));

  return NextResponse.json({ proposals });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, club_id, attachments, date } = body;

  if (!title || !description || !club_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("event_proposals")
    .insert([
      {
        title,
        description,
        club_id,
        attachments: attachments || [],
        status: "Pending",
        created_by: user.id,
        date,
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
