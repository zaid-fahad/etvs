// app/api/club/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// const supabase = await createClient();

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clubs").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ clubs: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  try {
    const body = await req.json();
    const { name, description, department, email } = body;

    if (!name || !description || !department || !email) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("clubs")
      .insert([{ name, description, department, email }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Club created", club: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
