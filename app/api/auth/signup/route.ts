import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // your server client

export async function POST(req: NextRequest) {
  const { email, password, name, student_id, department } = await req.json();

  const supabase = await createClient(); // ✅ use your server client

  // 1️⃣ Sign up user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email`,
    },
  });

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  const user = signUpData.user;
//   const session = signUpData.session;

  if (!user) {
    return NextResponse.json({ error: "Signup failed" }, { status: 400 });
  }

  // 2️⃣ Create profile in 'profiles' table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      student_id: student_id ,
      full_name: name || null,
      dept: department || null,
      role: "student", // default role
    })
    .select()
    .single();

  if (profileError || !profile) {
    console.error("Profile creation error:", profileError);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 400 });
  }

  // 3️⃣ Return full info
  return NextResponse.json({success: true, user: { email: user.email, role: profile.role }});
}
