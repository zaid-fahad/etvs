import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // your server client

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const supabase = await createClient(); // use your server client

  // 1️⃣ Sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return NextResponse.json({ error: signInError.message }, { status: 400 });
  }

  const user = signInData.user;
  const session = signInData.session;

  if (!user || !session) {
    return NextResponse.json({ error: "Login failed" }, { status: 400 });
  }

  // 2️⃣ Fetch profile info
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*") // fetch all profile fields
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 400 });
  }

  // 3️⃣ Return complete user info
  return NextResponse.json({
    user: {
    //   id: user.id,
      email: user.email,
    //   user_metadata: user.user_metadata,
      role: profile.role,
    //   profile, // include all profile info
    },
    session: {
      access_token: session.access_token,
      expires_at: session.expires_at,
    },
  });
}
