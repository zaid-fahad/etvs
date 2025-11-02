// app/api/events/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ event: data });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;
  const updates = await req.json();

  const { data, error } = await supabase.from("events").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ event: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
