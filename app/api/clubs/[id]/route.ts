// app/api/club/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// const supabase = await createClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { id } = await params;

  const { data, error } = await supabase.from("clubs").select("*").eq("id", id).single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ club: data });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    const { name, description, department, email } = await req.json();

    const { data, error } = await supabase
      .from("clubs")
      .update({ name, description, department, email })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: "Club updated", club: data });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase.from("clubs").delete().eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ message: "Club deleted", club: data });
}
