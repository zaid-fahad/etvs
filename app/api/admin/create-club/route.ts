import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { name, description, logo_url, contact_info } = await req.json();

  const { data, error } = await supabase
    .from("clubs")
    .insert({ name, description, logo_url, contact_info })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ club: data });
}
