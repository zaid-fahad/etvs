// app/api/club/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// const supabase = await createClient();

// Add manager
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  try {
    const { email, name, club_id } = await req.json();

    if (!email || !name || !club_id) {
      return NextResponse.json({ error: "Email, name, and club_id are required" }, { status: 400 });
    }

    // Check if profile already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Create auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-8),
      email_confirm: true,
    });

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    const user = signUpData.user;
    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 400 });
    }

    // Insert profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: name,
        role: "club",
        club_id,
        active: true,
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: profile });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Fetch assigned managers
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  try {
    const url = new URL(req.url);
    const club_id = url.searchParams.get("club_id");

    if (!club_id) {
      return NextResponse.json({ error: "club_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("club_id", club_id)
      .eq("role", "club"); // only managers

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ managers: data || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update manager
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  try {
    const { id, name, active, club_id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: name, active, club_id })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Remove manager from club
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    // Only remove club association
    const { data, error } = await supabase
      .from("profiles")
      .update({ club_id: null })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Manager removed from club", user: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
