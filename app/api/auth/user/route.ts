// app/api/auth/user/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the current logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || "No user found" }, { status: 401 });
    }

    // Fetch profile from public.profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles") // public schema
      .select("*")
      .eq("id", user.id)
      .single();
      console.log("Fetched profile:", profile);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ user, profile });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
