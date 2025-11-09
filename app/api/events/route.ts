// app/api/events/route.ts
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

  // Base query
  let query = supabase
    .from("events")
    .select(
      `
      *,
      clubs:club_id (
        name
      )
    `
    )
    .order("created_at", { ascending: false });

  // If not admin, restrict by club
  if (profile.role !== "admin") {
    query = query.eq("club_id", profile.club_id);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Flatten club name
  const events = data.map((e: any) => ({
    ...e,
    club_name: e.clubs?.name || "",
  }));

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, club_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 400 });
  }

  const { title, club_id, description, date, certificate_bg } = await req.json();

  // Validate input
  if (!title || !description || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Non-admin users can only create events for their own club
  const assignedClubId = profile.role === "admin" ? club_id : profile.club_id;

  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      club_id: assignedClubId,
      description,
      date,
      certificate_bg,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ event: data }, { status: 201 });
}
