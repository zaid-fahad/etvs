import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { email, password, club_id, name } = await req.json();

  // Create user in Supabase auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (signUpError) return NextResponse.json({ error: signUpError.message }, { status: 400 });

  const userId = signUpData.user?.id;
  if (!userId) return NextResponse.json({ error: "Failed to create user" }, { status: 400 });

  // Insert into profiles
  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: userId, email, name, role: "club", club_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ profile: data });
}
