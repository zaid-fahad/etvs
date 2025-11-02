// app/api/events/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ events: data });
}

export async function POST(req: Request) {
  const { title, club_id, description, date, certificate_bg } = await req.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .insert({ title, club_id, description, date, certificate_bg })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ events: data });
}
